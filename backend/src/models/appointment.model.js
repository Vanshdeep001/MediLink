import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
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
  appointment_date: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'],
    default: 'SCHEDULED',
  },
  notes: String,
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

appointmentSchema.index({ patient_id: 1 });
appointmentSchema.index({ doctor_id: 1 });
appointmentSchema.index({ appointment_date: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
