import CategoryControllers from "../Controllers/categoryControllers.js";
import express from "express";
import { upload } from "../Middlewares/cloudinaryStorageMiddleware.js";

const categoryRoute = express.Router();

//create category
categoryRoute.post(
  "/",
  upload.single("image"),
  CategoryControllers.createCategory
);

//get all categories
categoryRoute.get("/", CategoryControllers.getAllCategories);

//get category by id
categoryRoute.get("/:id", CategoryControllers.getCategoryById);

//delete category
categoryRoute.delete("/:id", CategoryControllers.deleteCategory);

//update category
categoryRoute.patch(
  "/:id",
  upload.single("image"),
  CategoryControllers.editCategory
);
export default categoryRoute;
