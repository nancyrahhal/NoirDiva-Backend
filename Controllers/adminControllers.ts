import Admin from "../Models/adminModel.js";
import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
dotenv.config();

const createToken = (_id: string) => {
  return jwt.sign({ _id }, process.env.SECRET as string, { expiresIn: "1d" });
};

class AdminControllers {
  //admin create
  static async adminsignup(req: Request, res: Response) {
    const { username, password } = req.body;
    // const image=req.file as Express.Multer.File
    try {
      const newAdmin = await Admin.signup(
        username,
        password
        //  image
      );

      const token = createToken(newAdmin._id);
      return res.status(200).json({
        success: true,
        message: "Account successfully created",
        status: 200,
        data: newAdmin,
        token,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to create admin",
        status: 500,
        data: error.message,
      });
    }
  }
  //admin login
  static async adminLogin(req: Request, res: Response) {
    const { id } = req.params;

    const { username, password } = req.body;
    try {
      const admin = await Admin.login(username, password);
      const token = createToken(admin._id);
      return res.status(200).json({
        success: true,
        message: "You are logged in!",
        status: 200,
        data: admin,
        token,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to process login",
        status: 500,
        data: error.message,
      });
    }
  }
  //get all admins
  static async getAllAdmins(req: Request, res: Response) {
    try {
      const admins = await Admin.find({})
        .sort({ createdAt: -1 })
        .select("-password");
      return res.status(200).json({
        success: true,
        message: "Admins retrieved successfully",
        status: 200,
        data: admins,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve admins",
        status: 500,
        data: null,
      });
    }
  }
  //get admin by id
  static async getAdminById(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }

    try {
      const admin = await Admin.findById(id).select("-password");
      if (!admin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Admin retrieved successfully",
        status: 200,
        data: admin,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve the requested admin",
        status: 500,
        data: null,
      });
    }
  }
  //delete admin
  static async deleteAdmin(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      const deletedAdmin = await Admin.findByIdAndDelete(id).select(
        "-password"
      );
      if (!deletedAdmin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Admin deleted successfully",
        status: 200,
        data: deletedAdmin,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete the admin",
        status: 500,
        data: null,
      });
    }
  }
  //update admin
  static async updateAdmin(req: Request, res: Response) {
    const { id } = req.params;
    const { username } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      //check if admin exists to edit
      const existingAdmin = await Admin.findById(id);
      if (!existingAdmin) {
        return res.status(404).json({
          success: false,
          message: "Admin not found",
          status: 404,
          data: null,
        });
      }

      //check username if exists
      const existUsername = await Admin.findOne({ username });
      if (existUsername) {
        return res.status(500).json({
          success: false,
          message: "username already in use",
          status: 500,
          data: null,
        });
      }

      const updateAdmin = await Admin.findByIdAndUpdate(id, req.body, {
        new: true,
      });

      if (!updateAdmin) {
        return res.status(404).json({
          success: false,
          message: "Failed to update admin",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "Admin updated successfully",
        status: 200,
        data: updateAdmin,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update the Admin",
        status: 500,
        data: null,
      });
    }
  }
}
export default AdminControllers;
