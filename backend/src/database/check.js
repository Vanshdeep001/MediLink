import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Doctor from '../models/doctor.model.js';
import User from '../models/user.model.js';

dotenv.config();

const check = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const count = await Doctor.countDocuments({ status: 'APPROVED' });
    const docs = await Doctor.find({ status: 'APPROVED' }).populate('user_id');
    
    console.log(`STATUS: Found ${count} approved doctors.`);
    docs.forEach(d => {
      console.log(`DOCTOR: ${d.user_id ? d.user_id.name : 'Unknown'} | ID: ${d._id}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
check();
