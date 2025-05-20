import mongoose, { Schema } from 'mongoose';
import { isTemplateExpression } from 'typescript';

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

export const Assignment = mongoose.model(
  'Assignment',
  new Schema({
    title: { type: String, unique: true },
    description: String,
    assignmentLink: String,
    githubLink: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in-progress', 'completed'],
      default: 'pending',
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['template', 'assigned'],
    },
  })
);
