import mongoose from 'mongoose';

const CallSchema = new mongoose.Schema({
  call_id: { type: String, required: true, unique: true },
  agent_id: { type: String, default: 'AGENT_UNKNOWN' },
  borrower_id: { type: String, default: 'BORROWER_UNKNOWN' },
  original_filename: { type: String },
  audio_file_path: { type: String, required: true },
  audio_url: { type: String },
  duration: { type: Number, default: 0 },
  sample_rate: { type: Number, default: 16000 },
  channels: { type: Number, default: 1 },
  upload_date: { type: Date, default: Date.now },
  analysis_status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed'], 
    default: 'pending' 
  },
  processing_error: { type: String, default: null },
  overall_risk_level: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'unassigned'], 
    default: 'unassigned' 
  },
  risk_score: { type: Number, default: 0 },
  risk_reasons: [{ type: String }],
  call_summary: { type: String, default: '' },
  metrics: {
    talk_time_agent_sec: { type: Number, default: 0 },
    talk_time_borrower_sec: { type: Number, default: 0 },
    silence_duration_sec: { type: Number, default: 0 },
    total_pauses_count: { type: Number, default: 0 },
    dsp_events_count: { type: Number, default: 0 },
    flagged_segments_count: { type: Number, default: 0 }
  },
  review_status: {
    type: String,
    enum: ['pending_review', 'under_investigation', 'escalated', 'cleared'],
    default: 'pending_review'
  },
  is_demo: { type: Boolean, default: false },
  demo_scenario: { type: String, default: null }
}, { timestamps: true });

export default mongoose.model('Call', CallSchema);
