"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const categoryControllers_js_1 = __importDefault(require("../Controllers/categoryControllers.js"));
const express_1 = __importDefault(require("express"));
const cloudinaryStorageMiddleware_js_1 = require("../Middlewares/cloudinaryStorageMiddleware.js");
const categoryRoute = express_1.default.Router();
//create category
categoryRoute.post("/", cloudinaryStorageMiddleware_js_1.upload.single("image"), categoryControllers_js_1.default.createCategory);
//get all categories
categoryRoute.get("/", categoryControllers_js_1.default.getAllCategories);
//get category by id
categoryRoute.get("/:id", categoryControllers_js_1.default.getCategoryById);
//delete category
categoryRoute.delete("/:id", categoryControllers_js_1.default.deleteCategory);
//update category
categoryRoute.patch("/:id", cloudinaryStorageMiddleware_js_1.upload.single("image"), categoryControllers_js_1.default.editCategory);
exports.default = categoryRoute;
