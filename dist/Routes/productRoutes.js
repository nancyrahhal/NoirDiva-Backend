"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const productControllers_js_1 = __importDefault(require("../Controllers/productControllers.js"));
const express_1 = __importDefault(require("express"));
const cloudinaryStorageMiddleware_js_1 = require("../Middlewares/cloudinaryStorageMiddleware.js");
const productRoute = express_1.default.Router();
//create
productRoute.post("/:collectionId", cloudinaryStorageMiddleware_js_1.upload.single("image"), productControllers_js_1.default.createProduct);
//get all
productRoute.get("/", productControllers_js_1.default.getAllProducts);
//get by id
productRoute.get("/:id", productControllers_js_1.default.getProductById);
//get by id
productRoute.get("/collection/:collectionId", productControllers_js_1.default.getProductsByCollectionId);
//delete
productRoute.delete("/:id", productControllers_js_1.default.deleteProduct);
//edit
productRoute.patch("/:id", cloudinaryStorageMiddleware_js_1.upload.single("image"), productControllers_js_1.default.editProduct);
exports.default = productRoute;
