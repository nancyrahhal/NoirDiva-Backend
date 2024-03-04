import mongoose, { Schema, Types } from "mongoose";

interface IGiftcard {
  name: string;
  promocode: string;
  image: string;
  description: string;
  balance: number;
  remainingBalance: number;
  expiryDate: Date;
  collection: Types.ObjectId;
}

const Giftcard = new Schema<IGiftcard>(
  {
    name: {
      type: String,
      required: true,
    },
    promocode: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    balance: {
      type: Number,
      required: true,
    },
    remainingBalance: {
      type: Number,
    },
    expiryDate: {
      type: Date,
      required: true,
    },
    collection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IGiftcard>("Giftcard", Giftcard);
