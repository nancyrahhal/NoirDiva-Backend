import Address from "../Models/addressModel.js";
import User from "../Models/userModel.js";
import { Response, Request } from "express";
import mongoose from "mongoose";

class AddressControllers {
  //add address to user
  static async createAddress(req: Request, res: Response) {
    const { country, city, postalCode, details, phone } = req.body;
    const userId = req.params.userId;
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          status: 404,
          data: null,
        });
      }

      if (!country || !city || !postalCode || !details || !phone) {
        return res.status(400).json({
          success: false,
          message: "all fields are required",
          status: 400,
          data: null,
        });
      }

      const newAddress = new Address({
        ...req.body,
        user: userId,
      });
      await newAddress.save();

      user.addresses.push(newAddress._id);
      await user.save();
      return res.status(201).json({
        success: true,
        message: "Address added successfully",
        status: 201,
        data: newAddress,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to create address",
        status: 500,
        data: error.message,
      });
    }
  }
  //get all addresses
  static async getAllAddresses(req: Request, res: Response) {
    try {
      const addresses = await Address.find({}).populate({
        path: "user",
        select: "firstName lastName email", // Only include these fields
      });
      return res.status(200).json({
        success: true,
        message: "Addresses retrieved successfully",
        status: 200,
        data: addresses,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive addresses",
        status: 500,
        data: null,
      });
    }
  }

  //get address by id
  static async getAddressById(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      const address = await Address.findById(id).populate({
        path: "user",
        select: "firstName lastName email", // Only include these fields
      });
      if (!address) {
        return res.status(404).json({
          success: false,
          message: "address not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: false,
        message: "address retreived successfully",
        status: 200,
        data: address,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to retreive address",
        status: 500,
        data: error.message,
      });
    }
  }
  //delete address
  static async deleteAdrress(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      const address = await Address.findByIdAndDelete(id);
      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Address deleted successfully",
        status: 200,
        data: address,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete the address",
        status: 500,
        data: null,
      });
    }
  }
  //edit address
  static async editAddress(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }

    try {
      let address = await Address.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true }
      );
      if (!address) {
        return res.status(404).json({
          success: false,
          message: "Address not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Address updated successfully",
        status: 200,
        data: address,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update the address",
        status: 500,
        data: null,
      });
    }
  }
}
export default AddressControllers;
