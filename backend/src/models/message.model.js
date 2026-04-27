import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  appointment_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment', // Chat is usually tied to an appointment context
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  message_type: {
    type: String,
    enum: ['TEXT', 'IMAGE', 'FILE', 'PRESCRIPTION'],
    default: 'TEXT',
  },
  file_url: String,
  is_read: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

messageSchema.index({ sender_id: 1, receiver_id: 1 });
messageSchema.index({ appointment_id: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
