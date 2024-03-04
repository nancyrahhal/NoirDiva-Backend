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
const subcategoryModel_js_1 = __importDefault(require("../Models/subcategoryModel.js"));
const categoryModel_js_1 = __importDefault(require("../Models/categoryModel.js"));
const collectionModel_js_1 = __importDefault(require("../Models/collectionModel.js"));
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
class SubcategoryControllers {
    //create new subCategory
    static createSubcategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = req.file;
            const { name } = req.body;
            const categoryId = req.params.categoryId;
            try {
                const category = yield categoryModel_js_1.default.findById(categoryId);
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: "Category not found",
                        status: 404,
                        data: null,
                    });
                }
                if (!image || !name) {
                    return res.status(400).json({
                        success: false,
                        message: "all fields are required",
                        status: 400,
                        data: null,
                    });
                }
                const exists = yield subcategoryModel_js_1.default.findOne({ name });
                if (exists) {
                    return res.status(409).json({
                        success: false,
                        message: "Subcategory already exists",
                        status: 409,
                        data: null,
                    });
                }
                const fileurl = image.path;
                const newSubcategory = new subcategoryModel_js_1.default(Object.assign(Object.assign({}, req.body), { image: fileurl, category: categoryId }));
                yield newSubcategory.save();
                category.subcategories.push(newSubcategory._id);
                yield category.save();
                return res.status(201).json({
                    success: true,
                    message: "Subcategory added successfully",
                    status: 201,
                    data: newSubcategory,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to create subcategory",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //get all
    static getAllSubcategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const subcategories = yield subcategoryModel_js_1.default.find({}).populate({
                    path: 'collections',
                    populate: {
                        path: 'subcategory',
                        select: "_id name",
                        populate: {
                            path: "category",
                            select: "_id name"
                        }
                    },
                });
                if (subcategories.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "no subcategories",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "subcategories retreived successfully",
                    status: 200,
                    data: subcategories,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive subcategories",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //get by id
    static getSubcategoryById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const subCategory = yield subcategoryModel_js_1.default.findById(id).populate("collections");
                if (!subCategory) {
                    return res.status(404).json({
                        success: false,
                        message: "subcategory not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: false,
                    message: "subcategory retreived successfully",
                    status: 200,
                    data: subCategory,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive subcategory",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //delete
    static deleteSubcategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                //delete category
                const subCategory = yield subcategoryModel_js_1.default.findById(id);
                if (!subCategory) {
                    return res.status(404).json({
                        success: false,
                        message: "Subcategory not found",
                        status: 404,
                        data: null,
                    });
                }
                const collections = yield collectionModel_js_1.default.find({
                    subcategory: subCategory._id,
                });
                for (const collection of collections) {
                    const products = yield productModel_js_1.default.find({
                        productCollection: collection._id,
                    });
                    for (const product of products) {
                        if (product.image) {
                            yield deleteImageFromCloudinary(product.image);
                        }
                    }
                    yield productModel_js_1.default.deleteMany({ productCollection: collection._id });
                    if (collection.image) {
                        yield deleteImageFromCloudinary(collection.image);
                    }
                    yield collectionModel_js_1.default.findByIdAndDelete(collection._id);
                }
                if (subCategory.image) {
                    yield deleteImageFromCloudinary(subCategory.image);
                }
                //delete the category
                yield subcategoryModel_js_1.default.findByIdAndDelete(id);
                return res.status(200).json({
                    success: true,
                    message: "Category deleted successfully",
                    status: 200,
                    data: null,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete the category",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //update subcategory
    static editSubcategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                let subCategory = yield subcategoryModel_js_1.default.findById(id);
                if (!subCategory) {
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
                    if (subCategory.image) {
                        yield deleteImageFromCloudinary(subCategory.image);
                    }
                    updateFields.image = newImg.path;
                }
                const updatedSubcategory = yield subcategoryModel_js_1.default.findByIdAndUpdate(id, updateFields, { new: true });
                return res.status(200).json({
                    success: true,
                    message: "Subcategory updated successfully",
                    status: 200,
                    data: updatedSubcategory,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to update the subcategory",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
}
exports.default = SubcategoryControllers;
