import ComplianceRule from '../models/ComplianceRule.js';
import { DEFAULT_COMPLIANCE_RULES } from '../config/defaultRules.js';

// Seed default rules if not existing
export const initializeRules = async () => {
  try {
    const count = await ComplianceRule.countDocuments();
    if (count === 0) {
      await ComplianceRule.insertMany(DEFAULT_COMPLIANCE_RULES);
      console.log('[Rules] Initialized default statutory compliance rules');
    }
  } catch (err) {
    console.error('[Rules] Initialization error:', err.message);
  }
};

// Get all rules
export const getRules = async (req, res) => {
  try {
    const rules = await ComplianceRule.find().sort({ createdAt: 1 });
    res.json({ success: true, rules });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update a rule's parameters
export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { parameters, is_active, severity } = req.body;

    const rule = await ComplianceRule.findOneAndUpdate(
      { rule_id: id },
      { $set: { parameters, is_active, severity } },
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Compliance rule not found' });
    }

    res.json({ success: true, message: 'Rule updated successfully', rule });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
