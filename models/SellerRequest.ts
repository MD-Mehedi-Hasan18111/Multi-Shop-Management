import mongoose, { Schema, model, models } from "mongoose";

const SellerRequestSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    shopName: {
      type: String,
      required: true,
    },
    niche: {
      type: String,
      required: true,
    },
    nidNumber: {
      type: String,
      required: true,
    },
    nidImage: {
      type: String,
      required: true,
    },
    productDetails: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const SellerRequest = models.SellerRequest || model("SellerRequest", SellerRequestSchema);
export default SellerRequest;
