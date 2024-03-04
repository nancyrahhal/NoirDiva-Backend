import User from "../Models/userModel.js";
import Address from "../Models/addressModel.js";
import { Response, Request } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
dotenv.config();

const createToken = (_id: string) => {
  return jwt.sign({ _id }, process.env.SECRET as string, { expiresIn: "1d" });
};

class UserControllers {
  //user signup
  static async usersignup(req: Request, res: Response) {
    const { firstName, lastName, email, password } = req.body;

    try {
      const newUser = await User.signup(firstName, lastName, email, password);

      const token = createToken(newUser._id);
      return res.status(200).json({
        success: true,
        message: "Account successfully created",
        status: 200,
        data: newUser,
        token,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "failed to process signup",
        status: 500,
        data: error.message,
      });
    }
  }

  //user login
  static async userlogin(req: Request, res: Response) {
    const { email, password } = req.body;
    try {
      const user = await User.login(email, password);
      const token = createToken(user._id);
      return res.status(200).json({
        success: true,
        message: "You are logged in!",
        status: 200,
        data: user,
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

  //get all users
  static async getAllUsers(req: Request, res: Response) {
    try {
      const users = await User.find({})
        .sort({ createdAt: -1 })
        .select("-password")
        .populate("addresses");
      return res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        status: 200,
        data: users,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve users",
        status: 500,
        data: null,
      });
    }
  }

  //get user by id
  static async getUserById(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }

    try {
      const user = await User.findById(id)
        .select("-password")
        .populate("addresses");
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "User retrieved successfully",
        status: 200,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve the requested user",
        status: 500,
        data: null,
      });
    }
  }

  //delete user
  static async deleteUser(req: Request, res: Response) {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      // Find the user by ID
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          status: 404,
          data: null,
        });
      }

      // Delete all addresses associated with the user
      await Address.deleteMany({ user: user._id });

      // Delete the user
      const deletedUser = await User.findByIdAndDelete(id).select("-password");

      return res.status(200).json({
        success: true,
        message: "User and associated addresses deleted successfully",
        status: 200,
        data: deletedUser,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete the user",
        status: 500,
        data: null,
      });
    }
  }
  //update user
  static async updateUser(req: Request, res: Response) {
    const { id } = req.params;
    const { firstName, lastName, password } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ error: "Not valid id format" });
    }
    try {
      let hash: string = "";
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User not found",
          status: 404,
          data: null,
        });
      }
      //if password edited, check if new pass is strong
      if (password) {
        if (!validator.isStrongPassword(password)) {
          return res.status(400).json({
            success: false,
            status: 400,
            message: "Password is not strong enough",
          });
        }
        const salt = await bcrypt.genSalt(10);
        hash = await bcrypt.hash(password, salt);
      }

      const updateUser = await User.findByIdAndUpdate(
        id,
        { password: hash, firstName, lastName },
        {
          new: true,
        }
      );

      if (!updateUser) {
        return res.status(404).json({
          success: false,
          message: "Failed to update user",
          status: 404,
          data: null,
        });
      }
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        status: 200,
        data: updateUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Failed to update the user",
        status: 500,
        data: null,
      });
    }
  }
}

export default UserControllers;
