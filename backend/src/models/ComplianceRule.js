import mongoose from 'mongoose';

const ComplianceRuleSchema = new mongoose.Schema({
  rule_id: { type: String, required: true, unique: true },
  rule_name: { type: String, required: true },
  rule_category: { 
    type: String, 
    enum: ['calling_hours', 'call_frequency', 'language_conduct', 'contact_parties'], 
    required: true 
  },
  description: { type: String, required: true },
  regulatory_reference: { type: String, default: 'RBI Fair Practices Code for Recovery / Master Directions' },
  parameters: {
    permitted_hours_start: { type: String, default: '08:00' }, // 08:00 AM
    permitted_hours_end: { type: String, default: '19:00' },   // 07:00 PM
    max_calls_per_borrower_per_day: { type: Number, default: 3 },
    min_interval_minutes: { type: Number, default: 120 },
    max_calls_per_week: { type: Number, default: 10 }
  },
  severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('ComplianceRule', ComplianceRuleSchema);
