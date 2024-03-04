"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const cloudinary_1 = require("cloudinary");
const multer_1 = __importDefault(require("multer"));
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true,
});
// Define the upload options with a public_id callback
const uploadOptions = {
    folder: "noirDivaImages",
    public_id: (req, file) => {
        // You can generate the public_id based on the file
        // For example, you could use the file name or a combination of the date and file name
        return `${Date.now()}-${file.originalname}`;
    },
};
// Storage configuration
const cloudinaryStorage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: uploadOptions,
});
exports.upload = (0, multer_1.default)({ storage: cloudinaryStorage });
