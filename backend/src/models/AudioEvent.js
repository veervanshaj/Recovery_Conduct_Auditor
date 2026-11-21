import mongoose from 'mongoose';

const AudioEventSchema = new mongoose.Schema({
  call_id: { type: String, required: true, index: true },
  start_time: { type: Number, required: true },
  end_time: { type: Number, required: true },
  event_type: { 
    type: String, 
    enum: ['loudness_increase', 'pitch_variation', 'long_pause', 'speech_overlap', 'spectral_strain'],
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['informational', 'low', 'medium', 'high'], 
    default: 'low' 
  },
  duration: { type: Number, default: 0 },
  measured_features: {
    rms_peak: Number,
    rms_relative_ratio: Number,
    pitch_hz: Number,
    pitch_relative_shift_semitones: Number,
    silence_ratio: Number,
    spectral_centroid: Number
  },
  description: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('AudioEvent', AudioEventSchema);
