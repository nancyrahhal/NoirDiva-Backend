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
const productModel_js_1 = __importDefault(require("../Models/productModel.js"));
const collectionModel_js_1 = __importDefault(require("../Models/collectionModel.js"));
const charityModel_js_1 = __importDefault(require("../Models/charityModel.js"));
const cloudinary_1 = require("cloudinary");
const mongoose_1 = __importDefault(require("mongoose"));
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
class ProductControllers {
    //create new collection
    static createProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const image = req.file;
            const { color, sizes, salePercentage, charityId } = req.body;
            const collectionId = req.params.collectionId;
            try {
                const collection = yield collectionModel_js_1.default.findById(collectionId);
                if (!collection) {
                    return res.status(404).json({
                        success: false,
                        message: "Collection not found",
                        status: 404,
                        data: null,
                    });
                }
                if (!image || !color || sizes.size || sizes.quantity) {
                    return res.status(400).json({
                        success: false,
                        message: "all fields are required",
                        status: 400,
                        data: null,
                    });
                }
                let charity = null;
                if (charityId) {
                    charity = yield charityModel_js_1.default.findById(charityId);
                    if (!charity) {
                        return res.status(404).json({
                            success: false,
                            message: "Charity not found",
                            status: 404,
                            data: null,
                        });
                    }
                }
                let salePercentageValue = salePercentage || 0;
                let saleprice = Math.round(collection.price - (salePercentageValue / 100) * collection.price);
                const fileurl = image.path;
                const newProduct = new productModel_js_1.default(Object.assign(Object.assign({}, req.body), { image: fileurl, productCollection: collectionId, salePercentage: salePercentageValue, saleprice: saleprice, charity: charity ? charity._id : null }));
                yield newProduct.save();
                if (charity) {
                    charity.products.push(newProduct._id);
                    yield charity.save();
                }
                collection.products.push(newProduct._id);
                yield collection.save();
                return res.status(201).json({
                    success: true,
                    message: "Product added successfully",
                    status: 201,
                    data: newProduct,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to create product",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //get all
    static getAllProducts(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const products = yield productModel_js_1.default.find({}).populate("productCollection");
                if (products.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "no products",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "products retreived successfully",
                    status: 200,
                    data: products,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive products",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //get by id
    static getProductById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const product = yield productModel_js_1.default.findById(id).populate("productCollection");
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: "product not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: false,
                    message: "product retreived successfully",
                    status: 200,
                    data: product,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive product",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //get by collection id
    static getProductsByCollectionId(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { collectionId } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(collectionId)) {
                return res.status(404).json({ error: "Not valid collection ID format" });
            }
            try {
                const products = yield productModel_js_1.default.find({ productCollection: collectionId }).populate("productCollection").populate('charity');
                if (products.length === 0) {
                    return res.status(404).json({
                        success: false,
                        message: "No products found for this collection",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Products retrieved successfully",
                    status: 200,
                    data: products,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to retrieve products for this collection",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //delete
    static deleteProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                //delete category
                const product = yield productModel_js_1.default.findById(id);
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: "Product not found",
                        status: 404,
                        data: null,
                    });
                }
                //delete the image from cloudinary to save storage
                if (product.image) {
                    // Extract the public_id from the full image URL
                    yield deleteImageFromCloudinary(product.image);
                }
                //delete the category
                yield productModel_js_1.default.findByIdAndDelete(id);
                return res.status(200).json({
                    success: true,
                    message: "Product deleted successfully",
                    status: 200,
                    data: null,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete the product",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //update
    static editProduct(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log(req.body)
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                //delete category
                let product = yield productModel_js_1.default.findById(id);
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: "Product not found",
                        status: 404,
                        data: null,
                    });
                }
                const newImg = req.file;
                let updateFields = Object.assign({}, req.body);
                if (newImg) {
                    if (product.image) {
                        // Extract the public_id from the full image URL
                        yield deleteImageFromCloudinary(product.image);
                    }
                    updateFields.image = newImg.path;
                }
                const { salePercentage } = req.body;
                if (salePercentage !== undefined) {
                    const collection = yield collectionModel_js_1.default.findById(product.productCollection);
                    if (!collection) {
                        return res.status(404).json({
                            success: false,
                            message: "Collection not found",
                            status: 404,
                            data: null,
                        });
                    }
                    let saleprice = Math.round(collection.price - (salePercentage / 100) * collection.price);
                    updateFields.salePercentage = salePercentage;
                    updateFields.saleprice = saleprice;
                }
                // Check if charityId is being updated
                if (req.body.charity && req.body.charity !== product.charity) {
                    // Find the charity by the new charityId
                    const charity = yield charityModel_js_1.default.findById(req.body.charity);
                    if (!charity) {
                        return res.status(404).json({
                            success: false,
                            message: "Charity not found",
                            status: 404,
                            data: null,
                        });
                    }
                    // Update the product's charity field
                    updateFields.charity = req.body.charity;
                    // Add the product's ID to the charity's products array
                    charity.products.push(product._id);
                    yield charity.save();
                }
                const updatedProduct = yield productModel_js_1.default.findByIdAndUpdate(id, updateFields, {
                    new: true,
                });
                return res.status(200).json({
                    success: true,
                    message: "Product updated successfully",
                    status: 200,
                    data: updatedProduct,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to update the product",
                    status: 500,
                    data: null,
                });
            }
        });
    }
}
exports.default = ProductControllers;
