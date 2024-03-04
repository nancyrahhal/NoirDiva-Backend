import User, { IUser } from "../Models/userModel.js";
import jwt from "jsonwebtoken";
import Admin, { IAdmin } from "../Models/adminModel.js";
import { Request, Response, NextFunction } from "express";

// Define the JwtPayload interface to include the '_id' property
interface JwtPayload {
  _id: string;
  // Include other properties that might be in the payload
}

// Extend the Request interface to include the 'user' property
declare module "express" {
  export interface Request {
    user?: IUser | IAdmin | null;
  }
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  const headerInput = req.headers["authorization"];
  const token = headerInput && headerInput.split(" ")[1];

  if (token == null) {
    return res.status(401).json("not authorized");
  }

  // Assert the type of decoded to be JwtPayload
  try {
    const decoded = jwt.verify(
      token,
      process.env.SECRET as string
    ) as JwtPayload;

    const user = await User.findById(decoded._id);
    const admin = await Admin.findById(decoded._id);

    req.user = user || admin;

    if (!req.user) {
      return res.status(404).json("user not found");
    }

    next();
  } catch (error) {
    return res.status(401).json("invalid token");
  }
};

export default protect;
