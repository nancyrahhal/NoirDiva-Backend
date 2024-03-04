"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const charityControllers_js_1 = __importDefault(require("../Controllers/charityControllers.js"));
const express_1 = __importDefault(require("express"));
const cloudinaryStorageMiddleware_js_1 = require("../Middlewares/cloudinaryStorageMiddleware.js");
const charityRoute = express_1.default.Router();
//create
charityRoute.post("/", cloudinaryStorageMiddleware_js_1.upload.single("image"), charityControllers_js_1.default.createCharity);
//get all
charityRoute.get("/", charityControllers_js_1.default.getAllCharities);
//get by id
charityRoute.get("/:id", charityControllers_js_1.default.getCharityById);
//delete charity
charityRoute.delete("/:id", charityControllers_js_1.default.deleteCharity);
//update charity
charityRoute.patch("/:id", cloudinaryStorageMiddleware_js_1.upload.single("image"), charityControllers_js_1.default.editCharity);
exports.default = charityRoute;
