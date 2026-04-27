/**
 * database/models/Message.model.js
 */

import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'system'],
      default: 'text',
    },
    // For file/image messages
    fileUrl: { type: String },
    fileName: { type: String },
    // Read receipts – array of userIds who have read this message
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        readAt: { type: Date, default: Date.now },
      },
    ],
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
  },
  { timestamps: true, versionKey: false }
);

messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
