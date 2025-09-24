import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a course title'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a course description'],
    trim: true,
  },
  lecturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide a lecturer ID'],
  },
  materials: [{
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    fileUrl: {
      type: String,
    },
    type: {
      type: String,
      enum: ['document', 'video', 'link'],
      default: 'document',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }],
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  thumbnail: {
    type: String,
    default: '/images/default-course.jpg',
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

// Virtual for lecturer name
CourseSchema.virtual('lecturer', {
  ref: 'User',
  localField: 'lecturerId',
  foreignField: '_id',
  justOne: true,
});

// Method to check if a user is enrolled
CourseSchema.methods.isEnrolled = function(userId) {
  return this.enrolledStudents.some(studentId => 
    studentId.toString() === userId.toString()
  );
};

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);
