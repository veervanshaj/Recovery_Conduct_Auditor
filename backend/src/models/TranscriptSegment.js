import mongoose from 'mongoose';

const TranscriptSegmentSchema = new mongoose.Schema({
  call_id: { type: String, required: true, index: true },
  start_time: { type: Number, required: true },
  end_time: { type: Number, required: true },
  speaker: { type: String, default: 'SPEAKER_UNKNOWN' },
  text: { type: String, required: true },
  words: [{
    word: String,
    start: Number,
    end: Number,
    probability: Number
  }],
  confidence: { type: Number, default: 1.0 },
  language: { type: String, default: 'en' }
}, { timestamps: true });

export default mongoose.model('TranscriptSegment', TranscriptSegmentSchema);
