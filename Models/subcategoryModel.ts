import mongoose, { ObjectId, Schema, Types } from "mongoose";

interface ISubcategory {
  name: string;
  image: string;
  category: Types.ObjectId;
  collections: Types.Array<ObjectId>;
}
const Subcategory = new Schema<ISubcategory>(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    collections: [
      {
        type: Schema.Types.ObjectId,
        ref: "Collection",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ISubcategory>("Subcategory", Subcategory);
