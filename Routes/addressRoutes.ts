import express from "express";
import AddressControllers from "../Controllers/addressControllers.js";

const addressRoute = express.Router();

//create address
addressRoute.post("/:userId", AddressControllers.createAddress);

//get all addresses
addressRoute.get("/", AddressControllers.getAllAddresses);

//get address by id
addressRoute.get("/:id", AddressControllers.getAddressById);

//delete address
addressRoute.delete("/:id", AddressControllers.deleteAdrress);

//update
addressRoute.patch("/:id", AddressControllers.editAddress);

export default addressRoute;
