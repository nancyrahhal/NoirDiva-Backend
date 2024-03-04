import Collection from "../Models/collectionModel.js";
import Subcategory from "../Models/subcategoryModel.js";
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
class CollectionControllers {
  //create
  static async createCollection(req: Request, res: Response) {
    const image = req.file as Express.Multer.File;
    const { name, price, description, fabric } = req.body;
    const subcategoryId = req.params.subcategoryId;
    try {
      const subCategory = await Subcategory.findById(subcategoryId);
      if (!subCategory) {
        return res.status(404).json({
          success: false,
          message: "Subcategory not found",
          status: 404,
          data: null,
        });
      }
      if (!image || !name || !price || !description || !fabric) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
          status: 400,
          data: null,
        });
      }
      const exists = await Collection.findOne({ name });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Collection already exists",
          status: 409,
          data: null,
        });
      }
      const fileurl = image.path;
      const newCollection = new Collection({
        ...req.body,
        image: fileurl,
        subcategory: subcategoryId,
      });
      await newCollection.save();

      subCategory.collections.push(newCollection._id);
      await subCategory.save();
      return res.status(201).json({
        success: true,
        message: "Collection added successfully",
        status: 201,
        data: newCollection,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to create collection",
        status: 500,
        data: error.message,
      });
    }
  }
  //get all
  static async getAllCollections(req: Request, res: Response) {
    try {
      const collections = await Collection.find({})
      if (collections.length === 0) {
        return res.status(404).json({
          success: false,
          message: "no collections",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Collections retreived successfully",
        status: 200,
        data: collections,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive collections",
        status: 500,
        data: null,
      });
    }
  }
  //get by id
  static async getCollectionById(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      const collection = await Collection.findById(id).populate("products");
      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "collection not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: "Collection retreived successfully",
        status: 200,
        data: collection,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive collection",
        status: 500,
        data: error.message,
      });
    }
  }
  //delete
  static async deleteCollection(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      //delete category
      const collection = await Collection.findById(id);
      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
          status: 404,
          data: null,
        });
      }

      // Find all products associated with the collection
      const products = await Product.find({
        productCollection: collection._id,
      });

      // Delete images of each product from Cloudinary
      for (const product of products) {
        if (product.image) {
          // Assuming deleteImageFromCloudinary is a function that deletes an image from Cloudinary
          await deleteImageFromCloudinary(product.image);
        }
      }
      //delete products associated with the collection
      await Product.deleteMany({ productCollection: collection._id });
      //delete the image from cloudinary to save storage
      if (collection.image) {
        // Extract the public_id from the full image URL
        await deleteImageFromCloudinary(collection.image);
      }

      //delete the category
      await Collection.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Collection deleted successfully",
        status: 200,
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete the collection",
        status: 500,
        data: null,
      });
    }
  }
  //edit
  static async editCollection(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      let collection = await Collection.findById(id);
      if (!collection) {
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
        if (collection.image) {
          // Extract the public_id from the full image URL
          await deleteImageFromCloudinary(collection.image);
        }
        updateFields.image = newImg.path;
      }
      const updatedCollection = await Collection.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Collection updated successfully",
        status: 200,
        data: updatedCollection,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to update the collection",
        status: 500,
        data: error.message,
      });
    }
  }
}
export default CollectionControllers;
