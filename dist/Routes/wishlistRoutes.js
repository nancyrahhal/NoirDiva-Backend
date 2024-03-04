"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const wishlistControllers_js_1 = __importDefault(require("../Controllers/wishlistControllers.js"));
const express_1 = __importDefault(require("express"));
const wishlistRoute = express_1.default.Router();
const authMiddleware_js_1 = __importDefault(require("../Authentication/authMiddleware.js"));
wishlistRoute.post("/add", authMiddleware_js_1.default, wishlistControllers_js_1.default.addToWishlist);
wishlistRoute.post("/remove", authMiddleware_js_1.default, wishlistControllers_js_1.default.removeFromWishlist);
wishlistRoute.get("/:userId", authMiddleware_js_1.default, wishlistControllers_js_1.default.getUserWishlist);
exports.default = wishlistRoute;
