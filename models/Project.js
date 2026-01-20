const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Project must have an owner']
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'on-hold'],
        message: '{VALUE} is not a valid status'
      },
      default: 'active'
    },
    deadline: {
      type: Date,
      default: null
    },
    color: {
      type: String,
      default: '#3B82F6'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  {
    timestamps: true
  }
);

// Indexes for better query performance
projectSchema.index({ owner: 1, status: 1 });
projectSchema.index({ members: 1 });

module.exports = mongoose.model('Project', projectSchema);