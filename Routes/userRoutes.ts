import UserControllers from "../Controllers/userControllers.js";
import express from "express";
import protectAdmin from "../Authentication/authAdminMiddleware.js";
import protect from "../Authentication/authMiddleware.js";
const userRoute = express.Router();

//signup
userRoute.post("/signup", UserControllers.usersignup);

//login
userRoute.post("/login", UserControllers.userlogin);

//get all users
userRoute.get("/", UserControllers.getAllUsers);

//get user by id
userRoute.get("/:id", UserControllers.getUserById);

//delete user
userRoute.delete("/:id", UserControllers.deleteUser);

//update user
userRoute.patch("/:id", UserControllers.updateUser);

export default userRoute;
