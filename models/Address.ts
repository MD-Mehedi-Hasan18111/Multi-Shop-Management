import mongoose, { Schema, model, models } from 'mongoose';

const AddressSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide an address title (e.g., Home, Office)'],
      trim: true,
    },
    fullName: {
      type: String,
      required: [true, 'Please provide a full name'],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, 'Please provide a phone number'],
      trim: true,
    },
    streetAddress: {
      type: String,
      required: [true, 'Please provide a street address'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'Please provide a city'],
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'Please provide a state or province'],
      trim: true,
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide a zip code'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Please provide a country'],
      trim: true,
      default: 'Bangladesh', // Optional: set a default if needed
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Address = models.Address || model('Address', AddressSchema);

export default Address;
