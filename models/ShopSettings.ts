import mongoose, { Schema, model, models } from 'mongoose';

const ShopSettingsSchema = new Schema(
  {
    shopkeeper: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    shopName: {
      type: String,
      required: [true, 'Please provide a shop name'],
      default: 'My Shop',
    },
    slug: {
      type: String,
      unique: true,
      sparse: true,
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
    isBlocked: {
      type: Boolean,
      default: false,
    },
    homepage: {
      heroTitle: { type: String, default: "" },
      heroDescription: { type: String, default: "" },
      heroBtnText: { type: String, default: "" },
      heroBtnLink: { type: String, default: "" },
      promoTitle: { type: String, default: "" },
      promoDescription: { type: String, default: "" },
      promoDiscount: { type: String, default: "" },
      promoBtnText: { type: String, default: "" },
      promoBtnLink: { type: String, default: "" },
      promoBannerImage: { type: String, default: "" },
      features: {
        type: [
          {
            title: String,
            icon: String,
            description: String,
          }
        ],
        default: [
          { title: "Free Shipping", icon: "Truck", description: "On all orders over BDT 1000" },
          { title: "24/7 Support", icon: "Clock", description: "Dedicated customer service" },
          { title: "Secure Payment", icon: "Shield", description: "100% secure payment gateway" }
        ]
      }
    }
  },
  {
    timestamps: true,
  }
);

if (models.ShopSettings) {
  delete (mongoose as any).models.ShopSettings;
}
const ShopSettings = model('ShopSettings', ShopSettingsSchema);

export default ShopSettings;
