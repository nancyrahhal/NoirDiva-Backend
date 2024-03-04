"use strict";
// interface ICharity {
//     name: string;
//     description: string;
//     charityPercentage: number;
//     products: Types.Array<Types.ObjectId>;
//   }
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const charityModel_js_1 = __importDefault(require("../Models/charityModel.js"));
const productModel_js_1 = __importDefault(require("../Models/productModel.js"));
const mongoose_1 = __importDefault(require("mongoose"));
const cloudinary_1 = require("cloudinary");
function deleteImageFromCloudinary(imageurl) {
    return __awaiter(this, void 0, void 0, function* () {
        // Extract the public_id from the full image URL
        const urlParts = imageurl.split("/");
        let publicId = urlParts[urlParts.length - 2] + "/" + urlParts[urlParts.length - 1];
        // Remove the file extension from the public_id
        publicId = publicId.slice(0, publicId.lastIndexOf(".")); // Remove file extension
        if (publicId && publicId !== "undefined") {
            console.log("Deleting image with publicId:", publicId);
            try {
                yield cloudinary_1.v2.uploader.destroy(publicId);
                console.log("Successfully deleted image from Cloudinary:", publicId);
            }
            catch (error) {
                console.error("Error deleting image from Cloudinary:", error);
                // Handle the error appropriately, e.g., return an error response
            }
        }
        else {
            console.error("publicId is undefined or not found in the image URL");
        }
    });
}
class CharityControllers {
    //create charity
    static createCharity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = req.file;
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
                const exists = yield charityModel_js_1.default.findOne({ name });
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
                const newCharity = yield charityModel_js_1.default.create(Object.assign(Object.assign({}, req.body), { image: fileurl }));
                return res.status(201).json({
                    success: true,
                    message: "Charity created successfully",
                    status: 201,
                    data: newCharity,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to create charity",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //get all charities
    static getAllCharities(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const charities = yield charityModel_js_1.default.find({}).populate("products");
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
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive charities",
                    status: 500,
                    data: error,
                });
            }
        });
    }
    //get charity by id
    static getCharityById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const charity = yield charityModel_js_1.default.findById(id).populate("products");
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
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive charity",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //delete
    static deleteCharity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const charity = yield charityModel_js_1.default.findById(id);
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
                    yield deleteImageFromCloudinary(charity.image);
                }
                // Remove references to the charity from all associated products
                yield productModel_js_1.default.updateMany({ charity: charity._id }, { $unset: { charity: "" } });
                yield charityModel_js_1.default.findByIdAndDelete(id);
                return res.status(200).json({
                    success: true,
                    message: "Charity deleted successfully",
                    status: 200,
                    data: null,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete the charity",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    static editCharity(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                let charity = yield charityModel_js_1.default.findById(id);
                if (!charity) {
                    return res.status(404).json({
                        success: false,
                        message: "Charity not found",
                        status: 404,
                        data: null,
                    });
                }
                const newImg = req.file;
                let updateFields = Object.assign({}, req.body);
                if (newImg) {
                    if (charity.image) {
                        // Extract the public_id from the full image URL
                        yield deleteImageFromCloudinary(charity.image);
                    }
                    updateFields.image = newImg.path;
                }
                const updatedCharity = yield charityModel_js_1.default.findByIdAndUpdate(id, updateFields, { new: true });
                return res.status(200).json({
                    success: true,
                    message: "Charity updated successfully",
                    status: 200,
                    data: updatedCharity,
                });
            }
            catch (error) {
                console.error("Error updating charity:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to update the charity",
                    status: 500,
                    data: null,
                });
            }
        });
    }
}
exports.default = CharityControllers;
