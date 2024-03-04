import { ObjectId } from "mongodb";
import mongoose, { Schema, Types } from "mongoose";

interface ICollection {
  name: String;
  image: string;
  price: number;
  fabric: string;
  description: String;
  subcategory: Types.ObjectId;
  products: Types.Array<ObjectId>;
}

const Collection = new Schema<ICollection>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    fabric: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    subcategory: {
      type: Schema.Types.ObjectId,
      ref: "Subcategory",
    },
    products: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICollection>("Collection", Collection);
