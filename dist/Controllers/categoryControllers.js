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
const categoryModel_js_1 = __importDefault(require("../Models/categoryModel.js"));
const subcategoryModel_js_1 = __importDefault(require("../Models/subcategoryModel.js"));
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
class CategoryControllers {
    //create a new category
    static createCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = req.file;
            const { name } = req.body;
            try {
                if (!name || !image) {
                    return res.status(400).json({
                        success: false,
                        message: "all fields are required",
                        status: 400,
                        data: null,
                    });
                }
                const exists = yield categoryModel_js_1.default.findOne({ name });
                if (exists) {
                    return res.status(409).json({
                        success: false,
                        message: "Category already exists",
                        status: 409,
                        data: null,
                    });
                }
                const fileurl = image.path;
                console.log(fileurl);
                const newCategory = yield categoryModel_js_1.default.create(Object.assign(Object.assign({}, req.body), { image: fileurl }));
                return res.status(201).json({
                    success: true,
                    message: "Category created successfully",
                    status: 201,
                    data: newCategory,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to create category",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //get all categories
    static getAllCategories(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const categories = yield categoryModel_js_1.default.find({}).populate("subcategories");
                if (categories.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "no categories",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "categories retreived successfully",
                    status: 200,
                    data: categories,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive categories",
                    status: 500,
                    data: error,
                });
            }
        });
    }
    //get category by id
    static getCategoryById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const category = yield categoryModel_js_1.default.findById(id).populate("subcategories");
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: "category not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: false,
                    message: "category retreived successfully",
                    status: 200,
                    data: category,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive category",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //delete category
    static deleteCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                //delete category
                const category = yield categoryModel_js_1.default.findById(id);
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: "Category not found",
                        status: 404,
                        data: null,
                    });
                }
                // Find all subcategories associated with the category
                const subcategories = yield subcategoryModel_js_1.default.find({ category: category._id });
                // Iterate over each subcategory
                for (const subcategory of subcategories) {
                    // Find all collections associated with the subcategory
                    const collections = yield collectionModel_js_1.default.find({
                        subcategory: subcategory._id,
                    });
                    // Iterate over each collection and delete its image from Cloudinary
                    for (const collection of collections) {
                        if (collection.image) {
                            yield deleteImageFromCloudinary(collection.image);
                        }
                        const products = yield productModel_js_1.default.find({
                            productCollection: collection._id,
                        });
                        for (const product of products) {
                            if (product.image) {
                                yield deleteImageFromCloudinary(product.image);
                            }
                        }
                        yield productModel_js_1.default.deleteMany({ productCollection: collection._id });
                        yield collectionModel_js_1.default.findByIdAndDelete(collection._id);
                    }
                    // Delete the subcategory image from Cloudinary
                    if (subcategory.image) {
                        yield deleteImageFromCloudinary(subcategory.image);
                    }
                    // Delete the subcategory
                    yield subcategoryModel_js_1.default.findByIdAndDelete(subcategory._id);
                }
                // Delete the category image from Cloudinary
                if (category.image) {
                    yield deleteImageFromCloudinary(category.image);
                }
                //delete the image from cloudinary to save storage
                //delete the category
                yield categoryModel_js_1.default.findByIdAndDelete(id);
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
    //edit category
    static editCategory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                let category = yield categoryModel_js_1.default.findById(id);
                if (!category) {
                    return res.status(404).json({
                        success: false,
                        message: "Category not found",
                        status: 404,
                        data: null,
                    });
                }
                const newImg = req.file;
                let updateFields = Object.assign({}, req.body);
                if (newImg) {
                    if (category.image) {
                        // Extract the public_id from the full image URL
                        yield deleteImageFromCloudinary(category.image);
                    }
                    updateFields.image = newImg.path;
                }
                const updatedCategory = yield categoryModel_js_1.default.findByIdAndUpdate(id, updateFields, { new: true });
                return res.status(200).json({
                    success: true,
                    message: "Category updated successfully",
                    status: 200,
                    data: updatedCategory,
                });
            }
            catch (error) {
                console.error("Error updating category:", error);
                return res.status(500).json({
                    success: false,
                    message: "Failed to update the category",
                    status: 500,
                    data: null,
                });
            }
        });
    }
}
exports.default = CategoryControllers;
