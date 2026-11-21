import fs from 'fs';
import csvParser from 'csv-parser';
import CallLog from '../models/CallLog.js';
import ComplianceRule from '../models/ComplianceRule.js';

// Parse CSV and analyze calling patterns against compliance rules
export const uploadAndAnalyzeCallLogs = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required' });
    }

    const results = [];
    const stream = fs.createReadStream(req.file.path).pipe(csvParser());

    stream.on('data', (row) => {
      // Normalize columns: borrower_id, agent_id, phone_number, call_datetime, call_duration, call_status
      const borrowerId = row.borrower_id || row['Borrower ID'] || row.borrower || 'UNKNOWN_BORROWER';
      const agentId = row.agent_id || row['Agent ID'] || row.agent || 'UNKNOWN_AGENT';
      const phoneNumber = row.phone_number || row['Phone Number'] || row.phone || 'UNKNOWN_PHONE';
      const callDatetime = row.call_datetime || row['Call Datetime'] || row.timestamp || row.date;
      const callDuration = parseInt(row.call_duration || row['Call Duration (s)'] || row.duration || 0, 10);
      const callStatus = (row.call_status || row['Call Status'] || 'completed').toLowerCase();

      if (callDatetime) {
        results.push({
          borrower_id: borrowerId.trim(),
          agent_id: agentId.trim(),
          phone_number: phoneNumber.trim(),
          call_datetime: new Date(callDatetime),
          call_duration_sec: callDuration,
          call_status: ['completed', 'missed', 'rejected', 'busy', 'voicemail'].includes(callStatus) ? callStatus : 'completed',
          is_synthetic: true
        });
      }
    });

    stream.on('end', async () => {
      try {
        if (results.length === 0) {
          return res.status(400).json({ success: false, message: 'CSV contained no valid call records' });
        }

        // Store to MongoDB
        await CallLog.insertMany(results);

        // Fetch active compliance rules
        const rules = await ComplianceRule.find({ is_active: true });
        const hoursRule = rules.find(r => r.rule_category === 'calling_hours') || {
          parameters: { permitted_hours_start: '08:00', permitted_hours_end: '19:00' }
        };
        const frequencyRule = rules.find(r => r.rule_id === 'RULE_CALL_FREQUENCY_SPIKE') || {
          parameters: { max_calls_per_borrower_per_day: 3 }
        };
        const intervalRule = rules.find(r => r.rule_id === 'RULE_CALL_INTERVAL_PERSISTENCE') || {
          parameters: { min_interval_minutes: 120 }
        };

        const violations = [];
        const patternSummary = {
          total_records: results.length,
          time_window_violations_count: 0,
          frequency_violations_count: 0,
          interval_violations_count: 0,
          unique_borrowers: new Set(results.map(r => r.borrower_id)).size,
          unique_agents: new Set(results.map(r => r.agent_id)).size,
          high_risk_agents: []
        };

        const [startHour, startMin] = hoursRule.parameters.permitted_hours_start.split(':').map(Number);
        const [endHour, endMin] = hoursRule.parameters.permitted_hours_end.split(':').map(Number);
        const maxDailyCalls = frequencyRule.parameters.max_calls_per_borrower_per_day;
        const minIntervalMin = intervalRule.parameters.min_interval_minutes;

        // Group by borrower & date
        const borrowerDateMap = {};
        const agentViolationMap = {};

        results.forEach((call) => {
          const dt = new Date(call.call_datetime);
          const hour = dt.getHours();
          const minute = dt.getMinutes();
          const timeDecimal = hour + minute / 60;
          const startDecimal = startHour + startMin / 60;
          const endDecimal = endHour + endMin / 60;

          // 1. Calling Hours Check (e.g. before 8 AM or after 7 PM)
          if (timeDecimal < startDecimal || timeDecimal > endDecimal) {
            patternSummary.time_window_violations_count++;
            violations.push({
              violation_type: 'PROHIBITED_CALLING_HOURS',
              rule_reference: hoursRule.regulatory_reference,
              borrower_id: call.borrower_id,
              agent_id: call.agent_id,
              timestamp: call.call_datetime,
              detail: `Call placed at ${dt.toLocaleTimeString()} (statutory permitted hours: ${hoursRule.parameters.permitted_hours_start} to ${hoursRule.parameters.permitted_hours_end})`,
              severity: hoursRule.severity
            });
            agentViolationMap[call.agent_id] = (agentViolationMap[call.agent_id] || 0) + 1;
          }

          // Grouping for daily frequency & rapid repetition
          const dateKey = dt.toISOString().split('T')[0];
          const groupKey = `${call.borrower_id}_${dateKey}`;
          if (!borrowerDateMap[groupKey]) borrowerDateMap[groupKey] = [];
          borrowerDateMap[groupKey].push(call);
        });

        // 2. Frequency & Interval checks
        Object.entries(borrowerDateMap).forEach(([groupKey, calls]) => {
          // Sort chronologically
          calls.sort((a, b) => new Date(a.call_datetime) - new Date(b.call_datetime));

          if (calls.length > maxDailyCalls) {
            patternSummary.frequency_violations_count++;
            violations.push({
              violation_type: 'DAILY_FREQUENCY_LIMIT_EXCEEDED',
              rule_reference: frequencyRule.regulatory_reference,
              borrower_id: calls[0].borrower_id,
              agent_id: calls[0].agent_id,
              timestamp: calls[calls.length - 1].call_datetime,
              detail: `Placed ${calls.length} calls on ${new Date(calls[0].call_datetime).toLocaleDateString()} (maximum permitted: ${maxDailyCalls} calls/day)`,
              severity: frequencyRule.severity
            });
            agentViolationMap[calls[0].agent_id] = (agentViolationMap[calls[0].agent_id] || 0) + 1;
          }

          // Check consecutive intervals
          for (let i = 1; i < calls.length; i++) {
            const diffMin = (new Date(calls[i].call_datetime) - new Date(calls[i - 1].call_datetime)) / (1000 * 60);
            if (diffMin < minIntervalMin && diffMin >= 0) {
              patternSummary.interval_violations_count++;
              violations.push({
                violation_type: 'AGGRESSIVE_CALL_REPETITION_INTERVAL',
                rule_reference: intervalRule.regulatory_reference,
                borrower_id: calls[i].borrower_id,
                agent_id: calls[i].agent_id,
                timestamp: calls[i].call_datetime,
                detail: `Follow-up call placed only ${Math.round(diffMin)} minutes after previous attempt (minimum cooldown requirement: ${minIntervalMin} mins)`,
                severity: intervalRule.severity
              });
              agentViolationMap[calls[i].agent_id] = (agentViolationMap[calls[i].agent_id] || 0) + 1;
            }
          }
        });

        // Summarize high risk agents
        patternSummary.high_risk_agents = Object.entries(agentViolationMap)
          .map(([agent_id, count]) => ({ agent_id, violations_count: count }))
          .sort((a, b) => b.violations_count - a.violations_count);

        res.json({
          success: true,
          message: 'Call pattern analysis completed successfully',
          summary: patternSummary,
          violations,
          recent_records: results.slice(0, 50)
        });
      } catch (err) {
        res.status(500).json({ success: false, message: err.message });
      }
    });

    stream.on('error', (err) => {
      res.status(500).json({ success: false, message: `Failed to parse CSV: ${err.message}` });
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get call logs with pagination
export const getCallLogs = async (req, res) => {
  try {
    const { borrower_id, agent_id, limit = 100, page = 1 } = req.query;
    const filter = {};
    if (borrower_id) filter.borrower_id = borrower_id;
    if (agent_id) filter.agent_id = agent_id;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const logs = await CallLog.find(filter)
      .sort({ call_datetime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CallLog.countDocuments(filter);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      logs
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
