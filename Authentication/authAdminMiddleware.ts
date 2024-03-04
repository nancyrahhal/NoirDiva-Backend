import jwt from "jsonwebtoken";
import Admin, { IAdmin } from "../Models/adminModel.js";
import { Request, Response, NextFunction } from "express";

interface JwtPayload {
  _id: string;
}



declare module "express" {
    export interface Request {
      admin?: IAdmin | null;
    }
  }

const protectAdmin=async(req:Request,res:Response,next:NextFunction)=>{
    const headerInput = req.headers["authorization"];
    const token = headerInput && headerInput.split(" ")[1];
  
    if (token == null) {
      return res.status(401).json("not authorized");
    }

    try {
        const decoded = jwt.verify(
          token,
          process.env.SECRET as string
        ) as JwtPayload;
    
        const admin = await Admin.findById(decoded._id);
    
        req.admin = admin;
    
        if (!req.admin) {
          return res.status(404).json("user not found");
        }
    
        next();
      } catch (error) {
        return res.status(401).json("invalid token");
      }
  
}

export default protectAdmin;