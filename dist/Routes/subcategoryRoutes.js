"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const subcategoryControllers_js_1 = __importDefault(require("../Controllers/subcategoryControllers.js"));
const express_1 = __importDefault(require("express"));
const cloudinaryStorageMiddleware_js_1 = require("../Middlewares/cloudinaryStorageMiddleware.js");
const subcategoryRoute = express_1.default.Router();
//create
subcategoryRoute.post("/:categoryId", cloudinaryStorageMiddleware_js_1.upload.single("image"), subcategoryControllers_js_1.default.createSubcategory);
//get all
subcategoryRoute.get("/", subcategoryControllers_js_1.default.getAllSubcategories);
//get by id
subcategoryRoute.get("/:id", subcategoryControllers_js_1.default.getSubcategoryById);
//delete
subcategoryRoute.delete("/:id", subcategoryControllers_js_1.default.deleteSubcategory);
//edit
subcategoryRoute.patch("/:id", cloudinaryStorageMiddleware_js_1.upload.single("image"), subcategoryControllers_js_1.default.editSubcategory);
exports.default = subcategoryRoute;
