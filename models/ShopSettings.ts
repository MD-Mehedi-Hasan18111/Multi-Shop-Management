import mongoose, { Schema, model, models } from 'mongoose';

const ShopSettingsSchema = new Schema(
  {
    shopName: {
      type: String,
      required: [true, 'Please provide a shop name'],
      default: 'My Shop',
    },
    logo: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#000000',
    },
    secondaryColor: {
      type: String,
      default: '#ffffff',
    },
    bannerImages: {
      type: [String],
      default: [],
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
    },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      linkedin: String,
    },
    aboutText: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const ShopSettings = models.ShopSettings || model('ShopSettings', ShopSettingsSchema);

export default ShopSettings;
