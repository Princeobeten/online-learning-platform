import mongoose from 'mongoose';

const AssessmentSchema = new mongoose.Schema({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, 'Assessment title is required'],
    trim: true,
  },
  type: {
    type: String,
    enum: ['quiz', 'assignment'],
    required: true,
  },
  description: {
    type: String,
    required: [true, 'Assessment description is required'],
    trim: true,
  },
  dueDate: {
    type: Date,
  },
  submission: {
    content: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    submittedAt: {
      type: Date,
    },
  },
  grade: {
    value: {
      type: Number,
      min: 0,
      max: 100,
    },
    feedback: {
      type: String,
    },
    gradedAt: {
      type: Date,
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  status: {
    type: String,
    enum: ['pending', 'submitted', 'graded'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Virtual for user details
AssessmentSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true,
});

// Virtual for course details
AssessmentSchema.virtual('course', {
  ref: 'Course',
  localField: 'courseId',
  foreignField: '_id',
  justOne: true,
});

export default mongoose.models.Assessment || mongoose.model('Assessment', AssessmentSchema);
