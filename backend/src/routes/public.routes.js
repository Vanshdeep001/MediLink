import express from 'express';
import Doctor from '../models/doctor.model.js';
import User from '../models/user.model.js';
import { getOnlineUserIds } from '../config/socket.js';

const router = express.Router();


/**
 * @route   GET /api/public/doctors
 * @desc    Get all approved doctors for chat
 * @access  Public
 */
router.get('/doctors', async (req, res) => {
  try {
    console.log('🔍 GET /api/public/doctors - Searching for approved doctors...');
    
    // Log total doctors in DB regardless of status
    const allDoctorsCount = await Doctor.countDocuments();
    console.log(`📊 Total doctors in database: ${allDoctorsCount}`);

    const doctors = await Doctor.find({ status: 'APPROVED' })
      .populate('user_id', 'name email profile_image_url')
      .exec();

    console.log(`✅ Found ${doctors.length} approved doctors`);

    const formattedDoctors = doctors.map(doc => {
      console.log(`👨‍⚕️ Formatting doctor: ${doc.user_id ? doc.user_id.name : 'ID:' + doc._id}`);
      return {
        id: doc.user_id ? doc.user_id._id.toString() : doc._id.toString(),
        name: doc.user_id ? doc.user_id.name : 'Unknown Doctor',
        specialization: doc.specialization || 'General',
        email: doc.user_id ? doc.user_id.email : '',
        experience: doc.years_of_experience || 0,
      };
    });

    res.json({
      success: true,
      data: formattedDoctors,
    });
  } catch (error) {
    console.error('❌ Error in /api/public/doctors:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch doctors',
      error: error.message
    });
  }
});

router.get('/online-status', (req, res) => {
  try {
    const onlineIds = getOnlineUserIds();
    res.json({
      success: true,
      data: onlineIds,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch online status' });
  }
});


export default router;

