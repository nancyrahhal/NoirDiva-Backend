import mongoose, { Schema, Types } from "mongoose";

interface IAddress {
  country: string;
  city: string;
  postalCode: string;
  details: string;
  phone: string;
  user: Types.ObjectId;
}

const Address = new Schema<IAddress>(
  {
    country: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    postalCode: {
      type: String,
      required: true,
    },
    details: {
      type: String,
    },
    phone: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAddress>("Address", Address);
