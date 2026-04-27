import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  pharmacy_name: {
    type: String,
    required: true,
  },
  owner_name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  city: String,
  state: String,
  pin_code: String,
  pharmacy_registration_number: {
    type: String,
    required: true,
    unique: true,
  },
  gst_number: {
    type: String,
    unique: true,
    sparse: true,
  },
  drug_license_certificate_url: String,
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

pharmacySchema.index({ user_id: 1 });
pharmacySchema.index({ pharmacy_registration_number: 1 });

const Pharmacy = mongoose.model('Pharmacy', pharmacySchema);
export default Pharmacy;
