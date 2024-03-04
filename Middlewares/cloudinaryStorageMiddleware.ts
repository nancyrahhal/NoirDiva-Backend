import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
  secure: true,
});

// Define the upload options with a public_id callback
const uploadOptions = {
  folder: "noirDivaImages",
  public_id: (req: Request, file: Express.Multer.File) => {
    // You can generate the public_id based on the file
    // For example, you could use the file name or a combination of the date and file name
    return `${Date.now()}-${file.originalname}`;
  },
};

// Storage configuration
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: uploadOptions as any,
});

export const upload = multer({ storage: cloudinaryStorage });
