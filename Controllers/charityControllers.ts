// interface ICharity {
//     name: string;
//     description: string;
//     charityPercentage: number;
//     products: Types.Array<Types.ObjectId>;
//   }

import Charity from "../Models/charityModel.js";
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

class CharityControllers {

    //create charity
  static async createCharity(req: Request, res: Response) {
    const image = req.file as Express.Multer.File;
    const { name, description, charityPercentage } = req.body;
    try {
      if (!name || !image || !description) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
          status: 400,
          data: null,
        });
      }

      const exists = await Charity.findOne({ name });
      if (exists) {
        return res.status(409).json({
          success: false,
          message: "Charity already exists",
          status: 409,
          data: null,
        });
      }

      const fileurl = image.path;
      console.log(fileurl);
      const newCharity = await Charity.create({
        ...req.body,
        image: fileurl,
      });
      return res.status(201).json({
        success: true,
        message: "Charity created successfully",
        status: 201,
        data: newCharity,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to create charity",
        status: 500,
        data: error.message,
      });
    }
  }

  //get all charities
  static async getAllCharities(req: Request, res: Response) {
    try {
      const charities = await Charity.find({}).populate("products");
      if (charities.length === 0) {
        return res.status(404).json({
          success: false,
          message: "no charities",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "charities retreived successfully",
        status: 200,
        data: charities,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive charities",
        status: 500,
        data: error,
      });
    }
  }

   //get charity by id

   static async getCharityById(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      const charity = await Charity.findById(id).populate("products");
      if (!charity) {
        return res.status(404).json({
          success: false,
          message: "charity not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: "charity retreived successfully",
        status: 200,
        data: charity,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive charity",
        status: 500,
        data: error.message,
      });
    }
  }

   //delete
   static async deleteCharity(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      const charity = await Charity.findById(id);
      if (!charity) {
        return res.status(404).json({
          success: false,
          message: "Charity not found",
          status: 404,
          data: null,
        });
      }

      //delete the image from cloudinary to save storage
      if (charity.image) {
        // Extract the public_id from the full image URL
        await deleteImageFromCloudinary(charity.image);
      }

      // Remove references to the charity from all associated products
    await Product.updateMany(
      { charity: charity._id },
      { $unset: { charity: "" } }
    );

      await Charity.findByIdAndDelete(id);

      return res.status(200).json({
        success: true,
        message: "Charity deleted successfully",
        status: 200,
        data: null,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete the charity",
        status: 500,
        data: null,
      });
    }
  }

  static async editCharity(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      let charity = await Charity.findById(id);
      if (!charity) {
        return res.status(404).json({
          success: false,
          message: "Charity not found",
          status: 404,
          data: null,
        });
      }

      const newImg = req.file as Express.Multer.File;
      let updateFields = { ...req.body };

      if (newImg) {
        if (charity.image) {
          // Extract the public_id from the full image URL
          await deleteImageFromCloudinary(charity.image);
        }
        updateFields.image = newImg.path;
      }
      const updatedCharity = await Charity.findByIdAndUpdate(
        id,
        updateFields,
        { new: true }
      );
      return res.status(200).json({
        success: true,
        message: "Charity updated successfully",
        status: 200,
        data: updatedCharity,
      });
    } catch (error) {
      console.error("Error updating charity:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update the charity",
        status: 500,
        data: null,
      });
    }
  }
}

export default CharityControllers