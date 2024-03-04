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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const wishListModel_js_1 = __importDefault(require("../Models/wishListModel.js"));
class WishlistControllers {
}
_a = WishlistControllers;
WishlistControllers.addToWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Request body:', req.body);
    const { userId, productId } = req.body;
    console.log(`Adding product to wishlist for user: ${userId}`);
    try {
        const wishlist = yield wishListModel_js_1.default.findOneAndUpdate({ user: userId }, { $addToSet: { products: productId } }, { new: true, upsert: true });
        console.log('Wishlist after update:', wishlist);
        return res.status(200).json(wishlist);
    }
    catch (error) {
        return res.status(500).json({ error: error.message });
    }
});
WishlistControllers.removeFromWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, productId } = req.body;
    try {
        const wishlist = yield wishListModel_js_1.default.findOneAndUpdate({ user: userId }, { $pull: { products: productId } }, { new: true });
        return res.status(200).json(wishlist);
    }
    catch (error) {
        return res.status(500).json({ error: error });
    }
});
WishlistControllers.getUserWishlist = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.params.userId;
    console.log(`Fetching wishlist for user: ${userId}`);
    try {
        const wishlist = yield wishListModel_js_1.default.findOne({ user: userId }).populate({
            path: "products",
            populate: {
                path: "productCollection", // Assuming 'productCollection' is the field in your Product schema that references the Collection model
            },
        });
        console.log('Fetched wishlist:', wishlist);
        return res.status(200).json({ "wishlist": wishlist });
    }
    catch (error) {
        console.error('Error fetching wishlist:', error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to get wishlist",
            status: 500,
            data: null,
        });
    }
});
exports.default = WishlistControllers;
