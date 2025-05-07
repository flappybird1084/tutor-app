import mongoose, { Schema } from 'mongoose';

export const User = mongoose.model(
  'User',
  new Schema({
    username: { type: String, unique: true },
    email: { type: String, unique: true },
    password_hash: String,
    role: {
      type: String,
      enum: ['user', 'moderator', 'admin'],
      default: ['user'],
    },
  })
);
