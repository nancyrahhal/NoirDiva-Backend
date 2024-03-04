"use strict";
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
const collectionModel_js_1 = __importDefault(require("../Models/collectionModel.js"));
const subcategoryModel_js_1 = __importDefault(require("../Models/subcategoryModel.js"));
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
class CollectionControllers {
    //create
    static createCollection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = req.file;
            const { name, price, description, fabric } = req.body;
            const subcategoryId = req.params.subcategoryId;
            try {
                const subCategory = yield subcategoryModel_js_1.default.findById(subcategoryId);
                if (!subCategory) {
                    return res.status(404).json({
                        success: false,
                        message: "Subcategory not found",
                        status: 404,
                        data: null,
                    });
                }
                if (!image || !name || !price || !description || !fabric) {
                    return res.status(400).json({
                        success: false,
                        message: "all fields are required",
                        status: 400,
                        data: null,
                    });
                }
                const exists = yield collectionModel_js_1.default.findOne({ name });
                if (exists) {
                    return res.status(409).json({
                        success: false,
                        message: "Collection already exists",
                        status: 409,
                        data: null,
                    });
                }
                const fileurl = image.path;
                const newCollection = new collectionModel_js_1.default(Object.assign(Object.assign({}, req.body), { image: fileurl, subcategory: subcategoryId }));
                yield newCollection.save();
                subCategory.collections.push(newCollection._id);
                yield subCategory.save();
                return res.status(201).json({
                    success: true,
                    message: "Collection added successfully",
                    status: 201,
                    data: newCollection,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to create collection",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //get all
    static getAllCollections(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const collections = yield collectionModel_js_1.default.find({});
                if (collections.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "no collections",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Collections retreived successfully",
                    status: 200,
                    data: collections,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive collections",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //get by id
    static getCollectionById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const collection = yield collectionModel_js_1.default.findById(id).populate("products");
                if (!collection) {
                    return res.status(404).json({
                        success: false,
                        message: "collection not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: false,
                    message: "Collection retreived successfully",
                    status: 200,
                    data: collection,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive collection",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //delete
    static deleteCollection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                //delete category
                const collection = yield collectionModel_js_1.default.findById(id);
                if (!collection) {
                    return res.status(404).json({
                        success: false,
                        message: "Collection not found",
                        status: 404,
                        data: null,
                    });
                }
                // Find all products associated with the collection
                const products = yield productModel_js_1.default.find({
                    productCollection: collection._id,
                });
                // Delete images of each product from Cloudinary
                for (const product of products) {
                    if (product.image) {
                        // Assuming deleteImageFromCloudinary is a function that deletes an image from Cloudinary
                        yield deleteImageFromCloudinary(product.image);
                    }
                }
                //delete products associated with the collection
                yield productModel_js_1.default.deleteMany({ productCollection: collection._id });
                //delete the image from cloudinary to save storage
                if (collection.image) {
                    // Extract the public_id from the full image URL
                    yield deleteImageFromCloudinary(collection.image);
                }
                //delete the category
                yield collectionModel_js_1.default.findByIdAndDelete(id);
                return res.status(200).json({
                    success: true,
                    message: "Collection deleted successfully",
                    status: 200,
                    data: null,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete the collection",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //edit
    static editCollection(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                let collection = yield collectionModel_js_1.default.findById(id);
                if (!collection) {
                    return res.status(404).json({
                        success: false,
                        message: "Subcategory not found",
                        status: 404,
                        data: null,
                    });
                }
                const newImg = req.file;
                let updateFields = Object.assign({}, req.body);
                if (newImg) {
                    if (collection.image) {
                        // Extract the public_id from the full image URL
                        yield deleteImageFromCloudinary(collection.image);
                    }
                    updateFields.image = newImg.path;
                }
                const updatedCollection = yield collectionModel_js_1.default.findByIdAndUpdate(id, updateFields, { new: true });
                return res.status(200).json({
                    success: true,
                    message: "Collection updated successfully",
                    status: 200,
                    data: updatedCollection,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to update the collection",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
}
exports.default = CollectionControllers;
