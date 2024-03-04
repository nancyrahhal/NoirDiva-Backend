import mongoose, { Collection, Schema, Types } from "mongoose";

interface IProduct {
  image: string;
  color: string;
  salePercentage: number;
  saleprice: number;
  productCollection: Types.ObjectId;
  charity: Types.ObjectId;
  sizes: {
    size: string;
    quantity: number;
  }[];
}

const Product = new Schema<IProduct>(
  {
    image: {
      type: String,
      required: true,
    },
    color: {
      type: String,
      required: true,
    },
    salePercentage: {
      type: Number,
      default:   0,
    },
    saleprice: {
      type: Number,
    },
    productCollection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
    charity: {
      type: Schema.Types.ObjectId,
      ref: "Charity",
    },
    sizes: {
      type: [
        {
          size: {
            type: String,
            required: true,
          },
          quantity: {
            type: Number,
            required: true,
          },
        },
      ],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IProduct>("Product", Product);
