import CharityControllers from "../Controllers/charityControllers.js";
import express from "express";
import { upload } from "../Middlewares/cloudinaryStorageMiddleware.js";

const charityRoute = express.Router();

//create
charityRoute.post(
  "/",
  upload.single("image"),
  CharityControllers.createCharity
);

//get all
charityRoute.get("/", CharityControllers.getAllCharities);

//get by id
charityRoute.get("/:id", CharityControllers.getCharityById);

//delete charity
charityRoute.delete("/:id", CharityControllers.deleteCharity);

//update charity

charityRoute.patch(
  "/:id",
  upload.single("image"),
  CharityControllers.editCharity
);
export default charityRoute;
