import WishlistControllers from "../Controllers/wishlistControllers.js";
import express from "express";
const wishlistRoute = express.Router();
import protect from "../Authentication/authMiddleware.js";


wishlistRoute.post("/add", protect,WishlistControllers.addToWishlist);

wishlistRoute.post("/remove", protect,WishlistControllers.removeFromWishlist);

wishlistRoute.get("/:userId", protect,WishlistControllers.getUserWishlist);



export default wishlistRoute;
