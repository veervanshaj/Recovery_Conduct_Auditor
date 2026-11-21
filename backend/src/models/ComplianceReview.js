import mongoose from 'mongoose';

const ComplianceReviewSchema = new mongoose.Schema({
  call_id: { type: String, required: true, index: true },
  reviewer_id: { type: String, default: 'COMPLIANCE_OFFICER_1' },
  review_status: { 
    type: String, 
    enum: ['pending_review', 'under_investigation', 'escalated', 'cleared'], 
    required: true 
  },
  reviewer_notes: { type: String, required: true },
  action_taken: { type: String, default: 'Logged in compliance register' },
  reviewed_at: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('ComplianceReview', ComplianceReviewSchema);
