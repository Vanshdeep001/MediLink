import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  specialization: {
    type: String,
    required: true,
  },
  license_number: {
    type: String,
    required: true,
    unique: true,
  },
  years_of_experience: {
    type: Number,
    required: true,
  },
  medical_council_registration: {
    type: String,
    required: true,
    unique: true,
  },
  certificate_url: String,
  government_id_url: String,
  government_id_type: {
    type: String,
    enum: ['AADHAR', 'PAN', 'PASSPORT'],
  },
  verified: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'PENDING',
  },
  verification_notes: String,
  verified_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  verified_at: Date,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

doctorSchema.index({ user_id: 1 });
doctorSchema.index({ status: 1 });

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
