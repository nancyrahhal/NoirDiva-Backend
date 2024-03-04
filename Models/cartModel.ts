import { Timestamp } from "mongodb";
import mongoose, { Schema, Types, ObjectId } from "mongoose";

interface ICartItem {
  product: Types.ObjectId;
  quantity: number;
}

interface ICart {
  user: Types.ObjectId;
  items: ICartItem[];
}

const CartItem = new Schema<ICartItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
  },
});

const Cart = new Schema<ICart>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    items: [CartItem],
  },
  { timestamps: true }
);

export default mongoose.model<ICart>("Cart", Cart);
