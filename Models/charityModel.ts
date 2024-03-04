import mongoose, { Schema, Types } from "mongoose";

interface ICharity {
  name: string;
  image: string;
  description: string;
  charityPercentage: number;
  products: Types.Array<Types.ObjectId>;
}

const Charity = new Schema<ICharity>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    charityPercentage: {
      type: Number,
      default:0,
      validate: {
        validator: function (v: number) {
          return typeof v === "number" && v >= 0 && v <= 100;
        },
        message: "Charity percentage must be a number between  0 and  100",
      },
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

export default mongoose.model<ICharity>("Charity", Charity);
