import SubcategoryControllers from "../Controllers/subcategoryControllers.js";
import express from "express";
import { upload } from "../Middlewares/cloudinaryStorageMiddleware.js";
const subcategoryRoute = express.Router();

//create
subcategoryRoute.post(
  "/:categoryId",
  upload.single("image"),
  SubcategoryControllers.createSubcategory
);

//get all
subcategoryRoute.get("/", SubcategoryControllers.getAllSubcategories);

//get by id
subcategoryRoute.get("/:id", SubcategoryControllers.getSubcategoryById);

//delete
subcategoryRoute.delete("/:id", SubcategoryControllers.deleteSubcategory);

//edit
subcategoryRoute.patch(
  "/:id",
  upload.single("image"),
  SubcategoryControllers.editSubcategory
);

export default subcategoryRoute;
