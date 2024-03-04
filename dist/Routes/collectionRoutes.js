"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const collectionControllers_js_1 = __importDefault(require("../Controllers/collectionControllers.js"));
const express_1 = __importDefault(require("express"));
const cloudinaryStorageMiddleware_js_1 = require("../Middlewares/cloudinaryStorageMiddleware.js");
const collectionRoute = express_1.default.Router();
//create
collectionRoute.post("/:subcategoryId", cloudinaryStorageMiddleware_js_1.upload.single("image"), collectionControllers_js_1.default.createCollection);
//get all
collectionRoute.get("/", collectionControllers_js_1.default.getAllCollections);
//get by id
collectionRoute.get("/:id", collectionControllers_js_1.default.getCollectionById);
//delete
collectionRoute.delete("/:id", collectionControllers_js_1.default.deleteCollection);
//edit
collectionRoute.patch("/:id", cloudinaryStorageMiddleware_js_1.upload.single("image"), collectionControllers_js_1.default.editCollection);
exports.default = collectionRoute;
