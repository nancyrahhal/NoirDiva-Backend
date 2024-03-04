import mongoose, { Schema, Types, ObjectId } from "mongoose";

interface ICategory {
  name: string;
  image: string;
  subcategories: Types.Array<ObjectId>;
}

const Category = new Schema<ICategory>(
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
    subcategories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Subcategory",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ICategory>("Category", Category);
