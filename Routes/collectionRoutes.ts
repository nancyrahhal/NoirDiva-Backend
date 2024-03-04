import CollectionControllers from "../Controllers/collectionControllers.js";
import express from "express";
import { upload } from "../Middlewares/cloudinaryStorageMiddleware.js";
const collectionRoute = express.Router();

//create
collectionRoute.post(
  "/:subcategoryId",
  upload.single("image"),
  CollectionControllers.createCollection
);

//get all
collectionRoute.get("/", CollectionControllers.getAllCollections);

//get by id
collectionRoute.get("/:id", CollectionControllers.getCollectionById);

//delete
collectionRoute.delete("/:id", CollectionControllers.deleteCollection);

//edit
collectionRoute.patch(
  "/:id",
  upload.single("image"),
  CollectionControllers.editCollection
);

export default collectionRoute;