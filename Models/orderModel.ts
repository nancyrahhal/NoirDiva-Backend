import mongoose, { Schema, Types } from "mongoose";

interface IOrder {
  user: Types.ObjectId;
  address: Types.ObjectId;
  products: Array<{
    product: Types.ObjectId;
    price: number;
    quantity: number;
  }>;
  status: string;
  giftcard?: Types.ObjectId;
  totalPrice: number;
  remainingPrice: number;
}

const Order = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    address: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    giftcard: {
      type: Schema.Types.ObjectId,
      ref: "Giftcard",
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    remainingPrice: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOrder>("Order", Order);
