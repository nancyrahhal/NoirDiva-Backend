import mongoose, { Schema, Types, ObjectId } from "mongoose";

interface IWishList {
  user: Types.ObjectId;
  products: Types.Array<ObjectId>;
}

const Wishlist = new Schema<IWishList>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

export default mongoose.model<IWishList>("Wishlist", Wishlist);
