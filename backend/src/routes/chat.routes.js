import express from 'express';
import Message from '../models/message.model.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

/**
 * @route   GET /api/chat/:appointmentId
 * @desc    Get chat history for a specific appointment
 */
router.get('/:appointmentId', authenticate, async (req, res) => {
  try {
    const { appointmentId } = req.params;

    const messages = await Message.find({ appointment_id: appointmentId })
      .sort({ created_at: 1 })
      .populate('sender_id', 'name role profile_image_url');

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history',
    });
  }
});

export default router;
