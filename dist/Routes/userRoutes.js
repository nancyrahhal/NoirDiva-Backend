"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userControllers_js_1 = __importDefault(require("../Controllers/userControllers.js"));
const express_1 = __importDefault(require("express"));
const userRoute = express_1.default.Router();
//signup
userRoute.post("/signup", userControllers_js_1.default.usersignup);
//login
userRoute.post("/login", userControllers_js_1.default.userlogin);
//get all users
userRoute.get("/", userControllers_js_1.default.getAllUsers);
//get user by id
userRoute.get("/:id", userControllers_js_1.default.getUserById);
//delete user
userRoute.delete("/:id", userControllers_js_1.default.deleteUser);
//update user
userRoute.patch("/:id", userControllers_js_1.default.updateUser);
exports.default = userRoute;
