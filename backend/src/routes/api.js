import express from 'express';
import { 
  uploadAndAnalyze, 
  getCalls, 
  getCallById, 
  submitReview, 
  getDashboardMetrics 
} from '../controllers/callController.js';
import { 
  uploadAndAnalyzeCallLogs, 
  getCallLogs 
} from '../controllers/callLogController.js';
import { 
  getRules, 
  updateRule 
} from '../controllers/rulesController.js';
import { 
  generateCallReport 
} from '../controllers/reportController.js';
import { uploadAudio, uploadCSV } from '../middleware/upload.js';
import { checkPythonServiceHealth } from '../services/pythonClient.js';
import Call from '../models/Call.js';
import TranscriptSegment from '../models/TranscriptSegment.js';
import AudioEvent from '../models/AudioEvent.js';
import FlaggedSegment from '../models/FlaggedSegment.js';
import ComplianceReview from '../models/ComplianceReview.js';

const router = express.Router();

// System Health
router.get('/health', async (req, res) => {
  const pythonHealth = await checkPythonServiceHealth();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    backend: 'healthy',
    python_audio_service: pythonHealth
  });
});

// Dashboard
router.get('/dashboard/metrics', getDashboardMetrics);

// Audio Calls
router.post('/calls/upload', uploadAudio.single('audio'), uploadAndAnalyze);
router.get('/calls', getCalls);
router.get('/calls/:id', getCallById);
router.post('/calls/:id/review', submitReview);
router.get('/calls/:id/report', generateCallReport);

// Call Logs (CSV Analysis)
router.post('/call-logs/upload', uploadCSV.single('csv'), uploadAndAnalyzeCallLogs);
router.get('/call-logs', getCallLogs);

// Compliance Rules
router.get('/rules', getRules);
router.put('/rules/:id', updateRule);

// Demo Data Seeder endpoint
router.post('/demo/seed', async (req, res) => {
  try {
    const { getDemoScenarios } = await import('../config/demoData.js');
    const scenarios = getDemoScenarios();

    for (const sc of scenarios) {
      await Call.findOneAndUpdate({ call_id: sc.call.call_id }, sc.call, { upsert: true, new: true });
      
      await TranscriptSegment.deleteMany({ call_id: sc.call.call_id });
      await TranscriptSegment.insertMany(sc.transcript.map(t => ({ ...t, call_id: sc.call.call_id })));
      
      await AudioEvent.deleteMany({ call_id: sc.call.call_id });
      await AudioEvent.insertMany(sc.audio_events.map(a => ({ ...a, call_id: sc.call.call_id })));

      await FlaggedSegment.deleteMany({ call_id: sc.call.call_id });
      await FlaggedSegment.insertMany(sc.flagged_segments.map(f => ({ ...f, call_id: sc.call.call_id })));

      if (sc.reviews && sc.reviews.length > 0) {
        await ComplianceReview.deleteMany({ call_id: sc.call.call_id });
        await ComplianceReview.insertMany(sc.reviews.map(r => ({ ...r, call_id: sc.call.call_id })));
      }
    }

    res.json({ success: true, message: 'Seeded 3 demo scenarios successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
