import Product from "../Models/productModel.js";
import Collection from "../Models/collectionModel.js";
import Charity from "../Models/charityModel.js";
import { Response, Request } from "express";
import { v2 as cloudinary } from "cloudinary";

import mongoose from "mongoose";

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

class ProductControllers {
  //create new collection

  static async createProduct(req: Request, res: Response) {
    const image = req.file as Express.Multer.File;
    const { color, sizes, salePercentage ,charityId} = req.body;
    const collectionId = req.params.collectionId;
    try {
      const collection = await Collection.findById(collectionId);
      if (!collection) {
        return res.status(404).json({
          success: false,
          message: "Collection not found",
          status: 404,
          data: null,
        });
      }
      if (!image || !color || sizes.size || sizes.quantity) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
          status: 400,
          data: null,
        });
      }
      let charity = null;
      if (charityId) {
        charity = await Charity.findById(charityId);
        if (!charity) {
          return res.status(404).json({
            success: false,
            message: "Charity not found",
            status: 404,
            data: null,
          });
        }
      }
      let salePercentageValue = salePercentage || 0;
      let saleprice = Math.round(
        collection.price - (salePercentageValue / 100) * collection.price
      );

      const fileurl = image.path;
      const newProduct = new Product({
        ...req.body,
        image: fileurl,
        productCollection: collectionId,
        salePercentage: salePercentageValue,
        saleprice: saleprice,
        charity:charity? charity._id:null
      });
      await newProduct.save();
      if (charity) {
        charity.products.push(newProduct._id);
        await charity.save();
      }

      collection.products.push(newProduct._id);
      await collection.save();

      return res.status(201).json({
        success: true,
        message: "Product added successfully",
        status: 201,
        data: newProduct,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to create product",
        status: 500,
        data: error.message,
      });
    }
  }
  //get all
  static async getAllProducts(req: Request, res: Response) {
    try {
      const products = await Product.find({}).populate("productCollection");
      if (products.length === 0) {
        return res.status(404).json({
          success: false,
          message: "no products",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "products retreived successfully",
        status: 200,
        data: products,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive products",
        status: 500,
        data: null,
      });
    }
  }

  //get by id
  static async getProductById(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      const product = await Product.findById(id).populate("productCollection");
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "product not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: "product retreived successfully",
        status: 200,
        data: product,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive product",
        status: 500,
        data: error.message,
      });
    }
  }

  //get by collection id
static async getProductsByCollectionId(req: Request, res: Response) {
  const { collectionId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(collectionId)) {
     return res.status(404).json({ error: "Not valid collection ID format" });
  }
  try {
     const products = await Product.find({ productCollection: collectionId }).populate("productCollection").populate('charity');
     if (products.length === 0) {
       return res.status(404).json({
         success: false,
         message: "No products found for this collection",
         status: 404,
         data: null,
       });
     }
     return res.status(200).json({
       success: true,
       message: "Products retrieved successfully",
       status: 200,
       data: products,
     });
  } catch (error:any) {
     return res.status(500).json({
       success: false,
       message: "Failed to retrieve products for this collection",
       status: 500,
       data: error.message,
     });
  }
 }
 
  //delete
  static async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      //delete category
      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
          status: 404,
          data: null,
        });
      }

      //delete the image from cloudinary to save storage
      if (product.image) {
        // Extract the public_id from the full image URL
        await deleteImageFromCloudinary(product.image);
      }

      //delete the category
      await Product.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Product deleted successfully",
        status: 200,
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete the product",
        status: 500,
        data: null,
      });
    }
  }
  //update
  static async editProduct(req: Request, res: Response) {
    // console.log(req.body)
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      //delete category
      let product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
          status: 404,
          data: null,
        });
      }

      const newImg = req.file as Express.Multer.File;
      let updateFields = { ...req.body };

      if (newImg) {
        if (product.image) {
          // Extract the public_id from the full image URL
          await deleteImageFromCloudinary(product.image);
        }
        updateFields.image = newImg.path;
      }

      const { salePercentage } = req.body;
      if (salePercentage !== undefined) {
        const collection = await Collection.findById(product.productCollection);
        if (!collection) {
          return res.status(404).json({
            success: false,
            message: "Collection not found",
            status: 404,
            data: null,
          });
        }

        let saleprice = Math.round(
          collection.price - (salePercentage / 100) * collection.price
        );
        updateFields.salePercentage = salePercentage;
        updateFields.saleprice = saleprice;
      }

       // Check if charityId is being updated
    if (req.body.charity && req.body.charity !== product.charity) {
      // Find the charity by the new charityId
      const charity = await Charity.findById(req.body.charity);
      if (!charity) {
        return res.status(404).json({
          success: false,
          message: "Charity not found",
          status: 404,
          data: null,
        });
      }

      // Update the product's charity field
      updateFields.charity = req.body.charity;

      // Add the product's ID to the charity's products array
      charity.products.push(product._id);
      await charity.save();
    }
      const updatedProduct = await Product.findByIdAndUpdate(id, updateFields, {
        new: true,
      });
      return res.status(200).json({
        success: true,
        message: "Product updated successfully",
        status: 200,
        data: updatedProduct,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update the product",
        status: 500,
        data: null,
      });
    }
  }
}
export default ProductControllers;
