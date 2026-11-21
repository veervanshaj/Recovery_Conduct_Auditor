import mongoose from 'mongoose';

const FlaggedSegmentSchema = new mongoose.Schema({
  call_id: { type: String, required: true, index: true },
  start_time: { type: Number, required: true },
  end_time: { type: Number, required: true },
  category: { 
    type: String, 
    enum: [
      'potential_intimidation', 
      'abusive_language', 
      'third_party_threat_employer_family', 
      'public_humiliation_threat', 
      'unreasonable_pressure_tactic', 
      'deceptive_or_misleading',
      'prohibited_calling_hour',
      'procedural_notice'
    ],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    default: 'medium' 
  },
  transcript_excerpt: { type: String, required: true },
  speaker: { type: String, default: 'SPEAKER_UNKNOWN' },
  language_evidence: { type: String, required: true },
  audio_evidence: [{ type: String }],
  context: { type: String, default: '' },
  reason_for_flag: { type: String, required: true },
  confidence: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  recommended_action: { type: String, default: 'Review original audio recording at indicated timestamp.' },
  review_status: {
    type: String,
    enum: ['pending', 'confirmed_violation', 'false_positive', 'needs_escalation'],
    default: 'pending'
  }
}, { timestamps: true });

export default mongoose.model('FlaggedSegment', FlaggedSegmentSchema);
