import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  age: Number,
  gender: {
    type: String,
    enum: ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'],
  },
  blood_group: String,
  medical_history: String,
  emergency_contact_name: String,
  emergency_contact_phone: String,
  address: String,
  city: String,
  state: String,
  pin_code: String,
  verified: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'],
    default: 'APPROVED',
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

patientSchema.index({ user_id: 1 });

const Patient = mongoose.model('Patient', patientSchema);
export default Patient;
