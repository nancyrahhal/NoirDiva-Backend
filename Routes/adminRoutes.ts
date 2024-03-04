import AdminControllers from "../Controllers/adminControllers.js";
import express from "express";
import protectAdmin from "../Authentication/authAdminMiddleware.js";

const adminRoute = express.Router();

//signup
adminRoute.post("/signup", AdminControllers.adminsignup);

//login
adminRoute.post("/login", AdminControllers.adminLogin);

//get all users
adminRoute.get("/", AdminControllers.getAllAdmins);

//get user by id
adminRoute.get("/:id", AdminControllers.getAdminById);

//delete user
adminRoute.delete("/:id", AdminControllers.deleteAdmin);

//update user
adminRoute.patch("/:id", AdminControllers.updateAdmin);

export default adminRoute;
