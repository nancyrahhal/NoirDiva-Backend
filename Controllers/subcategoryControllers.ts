import Subcategory from "../Models/subcategoryModel.js";
import Category from "../Models/categoryModel.js";
import Collection from "../Models/collectionModel.js";
import Product from "../Models/productModel.js";
import { Response, Request } from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

async function deleteImageFromCloudinary(imageurl: string) {
  // Extract the public_id from the full image URL
  const urlParts = imageurl.split("/");
  let publicId =
    urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
  // Remove the file extension from the public_id
  publicId = publicId.slice(0, publicId.lastIndexOf(".")); // Remove file extension
  if (publicId && publicId !== "undefined") {
    console.log("Deleting image with publicId:", publicId);
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log("Successfully deleted image from Cloudinary:", publicId);
    } catch (error) {
      console.error("Error deleting image from Cloudinary:", error);
      // Handle the error appropriately, e.g., return an error response
    }
  } else {
    console.error("publicId is undefined or not found in the image URL");
  }
}

class SubcategoryControllers {
  //create new subCategory
  static async createSubcategory(req: Request, res: Response) {
    const image = req.file as Express.Multer.File;
    const { name } = req.body;
    const categoryId = req.params.categoryId;
    try {
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
          status: 404,
          data: null,
        });
      }
      if (!image || !name) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
          status: 400,
          data: null,
        });
      }
      const exists = await Subcategory.findOne({ name });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Subcategory already exists",
          status: 409,
          data: null,
        });
      }
      const fileurl = image.path;
      const newSubcategory = new Subcategory({
        ...req.body,
        image: fileurl,
        category: categoryId,
      });
      await newSubcategory.save();

      category.subcategories.push(newSubcategory._id);
      await category.save();
      return res.status(201).json({
        success: true,
        message: "Subcategory added successfully",
        status: 201,
        data: newSubcategory,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to create subcategory",
        status: 500,
        data: error.message,
      });
    }
  }
  //get all
  static async getAllSubcategories(req: Request, res: Response) {
    try {
      const subcategories = await Subcategory.find({}).populate({
        path: 'collections',
        populate: {
          path: 'subcategory',
          select:"_id name",
          populate:{
            path:"category",
            select:"_id name"
          }
        },
      });
        if (subcategories.length === 0) {
        return res.status(404).json({
          success: false,
          message: "no subcategories",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "subcategories retreived successfully",
        status: 200,
        data: subcategories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive subcategories",
        status: 500,
        data: null,
      });
    }
  }
  //get by id
  static async getSubcategoryById(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      const subCategory = await Subcategory.findById(id).populate(
        "collections"
      );
      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message: "subcategory not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: "subcategory retreived successfully",
        status: 200,
        data: subCategory,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive subcategory",
        status: 500,
        data: error.message,
      });
    }
  }
  //delete
  static async deleteSubcategory(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      //delete category
      const subCategory = await Subcategory.findById(id);
      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found",
          status: 404,
          data: null,
        });
      }
      const collections = await Collection.find({
        subcategory: subCategory._id,
      });
      for (const collection of collections) {
        const products = await Product.find({
          productCollection: collection._id,
        });

        for (const product of products) {
          if (product.image) {
            await deleteImageFromCloudinary(product.image);
          }
        }
        await Product.deleteMany({ productCollection: collection._id });

        if (collection.image) {
          await deleteImageFromCloudinary(collection.image);
        }
        await Collection.findByIdAndDelete(collection._id);
      }

      if (subCategory.image) {
        await deleteImageFromCloudinary(subCategory.image);
      }

      //delete the category
      await Subcategory.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Category deleted successfully",
        status: 200,
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete the category",
        status: 500,
        data: null,
      });
    }
  }
  //update subcategory
  static async editSubcategory(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      let subCategory = await Subcategory.findById(id);
      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found",
          status: 404,
          data: null,
        });
      }

      const newImg = req.file as Express.Multer.File;

      let updateFields = { ...req.body };
      if (newImg) {
        if (subCategory.image) {
          await deleteImageFromCloudinary(subCategory.image);
        }
        updateFields.image = newImg.path;
      }
      const updatedSubcategory = await Subcategory.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Subcategory updated successfully",
        status: 200,
        data: updatedSubcategory,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to update the subcategory",
        status: 500,
        data: error.message,
      });
    }
  }
}
export default SubcategoryControllers;
