import mongoose, { Schema, model, models } from 'mongoose';

const AppSettingsSchema = new Schema(
  {
    shopName: {
      type: String,
      default: 'Shoppy',
    },
    logo: {
      type: String,
      default: '',
    },
    primaryColor: {
      type: String,
      default: '#3b82f6',
    },
    secondaryColor: {
      type: String,
      default: '#1e3a8a',
    },
    bannerImages: {
      type: [String],
      default: [],
    },
    contactInfo: {
      email: { type: String, default: 'mdmehedihasan18111@gmail.com' },
      phone: { type: String, default: '+88 01607-996992' },
      address: { type: String, default: 'Block - A, Road - 1, Halishahar, Chattogram' },
    },
    socialLinks: {
      facebook: { type: String, default: '' },
      instagram: { type: String, default: '' },
      twitter: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    aboutText: {
      type: String,
      default: 'The ultimate multi-shop ecosystem where local shops showcase products under one roof.',
    },
    homepage: {
      heroTitle: { type: String, default: "Your One-Stop Premium Marketplace" },
      heroDescription: { type: String, default: "Discover high quality, hand-picked goods from curated local merchants in Chattogram." },
      heroBtnText: { type: String, default: "Browse Shop" },
      heroBtnLink: { type: String, default: "/products" },
      promoTitle: { type: String, default: "Limited Campaign Sale!" },
      promoDescription: { type: String, default: "Get premium deals directly from verified local storefronts." },
      promoDiscount: { type: String, default: "Up to 50% Off" },
      promoBtnText: { type: String, default: "Get the Deal" },
      promoBtnLink: { type: String, default: "/deals" },
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
          { title: "Secure Payment", icon: "Shield", description: "100% secure cash on delivery" }
        ]
      }
    },
    seo: {
      metaTitle: { type: String, default: 'Shoppy - Multi-Shop Ecosystem' },
      metaDescription: { type: String, default: 'Discover products from local merchants in Chattogram.' },
    }
  },
  {
    timestamps: true,
  }
);

if (models.AppSettings) {
  delete (mongoose as any).models.AppSettings;
}
const AppSettings = model('AppSettings', AppSettingsSchema);

export default AppSettings;
