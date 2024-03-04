import Category from "../Models/categoryModel.js";
import Subcategory from "../Models/subcategoryModel.js";
import Collection from "../Models/collectionModel.js";
import Product from "../Models/productModel.js";
import { Response, Request } from "express";
import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";

async function deleteImageFromCloudinary(imageurl: any) {
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

class CategoryControllers {
  //create a new category
  static async createCategory(req: Request, res: Response) {
    const image = req.file as Express.Multer.File;
    const { name } = req.body;
    try {
      if (!name || !image) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
          status: 400,
          data: null,
        });
      }

      const exists = await Category.findOne({ name });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Category already exists",
          status: 409,
          data: null,
        });
      }

      const fileurl = image.path;
      console.log(fileurl);
      const newCategory = await Category.create({
        ...req.body,
        image: fileurl,
      });

      return res.status(201).json({
        success: true,
        message: "Category created successfully",
        status: 201,
        data: newCategory,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to create category",
        status: 500,
        data: error.message,
      });
    }
  }

  //get all categories
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await Category.find({}).populate("subcategories");
      if (categories.length === 0) {
        return res.status(404).json({
          success: false,
          message: "no categories",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "categories retreived successfully",
        status: 200,
        data: categories,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive categories",
        status: 500,
        data: error,
      });
    }
  }

  //get category by id

  static async getCategoryById(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      const category = await Category.findById(id).populate("subcategories");
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "category not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: "category retreived successfully",
        status: 200,
        data: category,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive category",
        status: 500,
        data: error.message,
      });
    }
  }

  //delete category
  static async deleteCategory(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      //delete category
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
          status: 404,
          data: null,
        });
      }

      // Find all subcategories associated with the category
      const subcategories = await Subcategory.find({ category: category._id });

      // Iterate over each subcategory
      for (const subcategory of subcategories) {
        // Find all collections associated with the subcategory
        const collections = await Collection.find({
          subcategory: subcategory._id,
        });

        // Iterate over each collection and delete its image from Cloudinary
        for (const collection of collections) {
          if (collection.image) {
            await deleteImageFromCloudinary(collection.image);
          }
          const products = await Product.find({
            productCollection: collection._id,
          });
          for (const product of products) {
            if (product.image) {
              await deleteImageFromCloudinary(product.image);
            }
          }
          await Product.deleteMany({ productCollection: collection._id });
          await Collection.findByIdAndDelete(collection._id);
        }

        // Delete the subcategory image from Cloudinary
        if (subcategory.image) {
          await deleteImageFromCloudinary(subcategory.image);
        }

        // Delete the subcategory
        await Subcategory.findByIdAndDelete(subcategory._id);
      }

      // Delete the category image from Cloudinary
      if (category.image) {
        await deleteImageFromCloudinary(category.image);
      }
      //delete the image from cloudinary to save storage

      //delete the category
      await Category.findByIdAndDelete(id);

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

  //edit category
  static async editCategory(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      let category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
          status: 404,
          data: null,
        });
      }

      const newImg = req.file as Express.Multer.File;
      let updateFields = { ...req.body };

      if (newImg) {
        if (category.image) {
          // Extract the public_id from the full image URL
          await deleteImageFromCloudinary(category.image);
        }
        updateFields.image = newImg.path;
      }
      const updatedCategory = await Category.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Category updated successfully",
        status: 200,
        data: updatedCategory,
      });
    } catch (error) {
      console.error("Error updating category:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update the category",
        status: 500,
        data: null,
      });
    }
  }
}

export default CategoryControllers;
