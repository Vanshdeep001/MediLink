import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.model.js';
import Doctor from '../models/doctor.model.js';
import Patient from '../models/patient.model.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('🔄 Seeding "medilink" database...');

    // Clear existing data in the medilink database
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});

    // 1. Create Dr. Om Sorathiya
    const omUser = await User.create({
      name: 'Dr. Om Sorathiya',
      email: 'omsorathiya@medilink.com',
      password: 'password123',
      role: 'DOCTOR',
      status: 'APPROVED',
      verified: true,
      email_verified: true,
    });

    await Doctor.create({
      user_id: omUser._id,
      specialization: 'General Medicine',
      license_number: 'DOC_OM_999',
      years_of_experience: 15,
      medical_council_registration: 'MC_OM_999',
      status: 'APPROVED',
      verified: true
    });

    // 2. Create Vanshdeep (Patient)
    const vanshdeepUser = await User.create({
      name: 'Vanshdeep',
      email: 'vanshdeep@medilink.com',
      password: 'password123',
      role: 'PATIENT',
      status: 'APPROVED',
      verified: true,
      email_verified: true,
    });

    await Patient.create({
      user_id: vanshdeepUser._id,
      age: 24,
      gender: 'MALE',
      blood_group: 'B+',
      status: 'APPROVED',
      verified: true
    });

    console.log('✅ Database "medilink" seeded successfully!');
    console.log('-----------------------------------------------');
    console.log('Online Doctor: Dr. Om Sorathiya');
    console.log('Patient User: Vanshdeep');
    console.log('-----------------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
