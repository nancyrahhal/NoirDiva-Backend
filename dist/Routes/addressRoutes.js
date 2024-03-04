"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const addressControllers_js_1 = __importDefault(require("../Controllers/addressControllers.js"));
const addressRoute = express_1.default.Router();
//create address
addressRoute.post("/:userId", addressControllers_js_1.default.createAddress);
//get all addresses
addressRoute.get("/", addressControllers_js_1.default.getAllAddresses);
//get address by id
addressRoute.get("/:id", addressControllers_js_1.default.getAddressById);
//delete address
addressRoute.delete("/:id", addressControllers_js_1.default.deleteAdrress);
//update
addressRoute.patch("/:id", addressControllers_js_1.default.editAddress);
exports.default = addressRoute;
