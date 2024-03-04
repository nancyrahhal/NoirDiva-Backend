import ProductControllers from "../Controllers/productControllers.js";
import express from "express";
import { upload } from "../Middlewares/cloudinaryStorageMiddleware.js";
const productRoute = express.Router();

//create
productRoute.post(
  "/:collectionId",
  upload.single("image"),
  ProductControllers.createProduct
);

//get all
productRoute.get("/", ProductControllers.getAllProducts);

//get by id
productRoute.get("/:id", ProductControllers.getProductById);

//get by id
productRoute.get("/collection/:collectionId", ProductControllers.getProductsByCollectionId);


//delete
productRoute.delete("/:id", ProductControllers.deleteProduct);

//edit
productRoute.patch(
  "/:id",
  upload.single("image"),
  ProductControllers.editProduct
);

export default productRoute;
