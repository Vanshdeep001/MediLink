import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema({
  patient_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  doctor_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
  },
  diagnosis: String,
  medications: {
    type: mongoose.Schema.Types.Mixed, // Equivalent to JSONB
  },
  notes: String,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

prescriptionSchema.index({ patient_id: 1 });
prescriptionSchema.index({ doctor_id: 1 });

const Prescription = mongoose.model('Prescription', prescriptionSchema);
export default Prescription;
