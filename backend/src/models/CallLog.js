import mongoose from 'mongoose';

const CallLogSchema = new mongoose.Schema({
  borrower_id: { type: String, required: true, index: true },
  agent_id: { type: String, required: true, index: true },
  phone_number: { type: String, required: true },
  call_datetime: { type: Date, required: true },
  call_duration_sec: { type: Number, default: 0 },
  call_status: { 
    type: String, 
    enum: ['completed', 'missed', 'rejected', 'busy', 'voicemail'], 
    default: 'completed' 
  },
  is_flagged_call: { type: Boolean, default: false },
  call_id: { type: String, default: null },
  is_synthetic: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('CallLog', CallLogSchema);
