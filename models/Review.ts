import mongoose, { Schema, model, models } from 'mongoose';

const ReviewSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    isApproved: {
      type: Boolean,
      default: false, // Requires admin moderation by default
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a user can only review a product once
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });

const Review = models.Review || model('Review', ReviewSchema);

export default Review;
