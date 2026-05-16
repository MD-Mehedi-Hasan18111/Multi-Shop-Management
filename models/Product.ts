import mongoose, { Schema, model, models } from 'mongoose';
import './Category';
import './User';

const ProductSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Please provide a slug'],
      unique: true,
      lowercase: true,
    },
    sku: {
      type: String,
      required: [true, 'Please provide an SKU'],
      unique: true,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0,
    },
    comparePrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: 0,
      default: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 5,
    },
    barcode: {
      type: String,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please provide a category'],
    },
    shopkeeper: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a shopkeeper'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
    },
    images: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product = models.Product || model('Product', ProductSchema);

export default Product;
