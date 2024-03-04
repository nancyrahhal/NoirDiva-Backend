"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const adminControllers_js_1 = __importDefault(require("../Controllers/adminControllers.js"));
const express_1 = __importDefault(require("express"));
const adminRoute = express_1.default.Router();
//signup
adminRoute.post("/signup", adminControllers_js_1.default.adminsignup);
//login
adminRoute.post("/login", adminControllers_js_1.default.adminLogin);
//get all users
adminRoute.get("/", adminControllers_js_1.default.getAllAdmins);
//get user by id
adminRoute.get("/:id", adminControllers_js_1.default.getAdminById);
//delete user
adminRoute.delete("/:id", adminControllers_js_1.default.deleteAdmin);
//update user
adminRoute.patch("/:id", adminControllers_js_1.default.updateAdmin);
exports.default = adminRoute;
