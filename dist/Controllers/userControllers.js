"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_js_1 = __importDefault(require("../Models/userModel.js"));
const addressModel_js_1 = __importDefault(require("../Models/addressModel.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const bcrypt_1 = __importDefault(require("bcrypt"));
dotenv_1.default.config();
const createToken = (_id) => {
    return jsonwebtoken_1.default.sign({ _id }, process.env.SECRET, { expiresIn: "1d" });
};
class UserControllers {
    //user signup
    static usersignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { firstName, lastName, email, password } = req.body;
            try {
                const newUser = yield userModel_js_1.default.signup(firstName, lastName, email, password);
                const token = createToken(newUser._id);
                return res.status(200).json({
                    success: true,
                    message: "Account successfully created",
                    status: 200,
                    data: newUser,
                    token,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to process signup",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //user login
    static userlogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            try {
                const user = yield userModel_js_1.default.login(email, password);
                const token = createToken(user._id);
                return res.status(200).json({
                    success: true,
                    message: "You are logged in!",
                    status: 200,
                    data: user,
                    token,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to process login",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //get all users
    static getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield userModel_js_1.default.find({})
                    .sort({ createdAt: -1 })
                    .select("-password")
                    .populate("addresses");
                return res.status(200).json({
                    success: true,
                    message: "Users retrieved successfully",
                    status: 200,
                    data: users,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to retrieve users",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //get user by id
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const user = yield userModel_js_1.default.findById(id)
                    .select("-password")
                    .populate("addresses");
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "User retrieved successfully",
                    status: 200,
                    data: user,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to retrieve the requested user",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //delete user
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                // Find the user by ID
                const user = yield userModel_js_1.default.findById(id);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found",
                        status: 404,
                        data: null,
                    });
                }
                // Delete all addresses associated with the user
                yield addressModel_js_1.default.deleteMany({ user: user._id });
                // Delete the user
                const deletedUser = yield userModel_js_1.default.findByIdAndDelete(id).select("-password");
                return res.status(200).json({
                    success: true,
                    message: "User and associated addresses deleted successfully",
                    status: 200,
                    data: deletedUser,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete the user",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //update user
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { firstName, lastName, password } = req.body;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                let hash = "";
                const existingUser = yield userModel_js_1.default.findById(id);
                if (!existingUser) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found",
                        status: 404,
                        data: null,
                    });
                }
                //if password edited, check if new pass is strong
                if (password) {
                    if (!validator_1.default.isStrongPassword(password)) {
                        return res.status(400).json({
                            success: false,
                            status: 400,
                            message: "Password is not strong enough",
                        });
                    }
                    const salt = yield bcrypt_1.default.genSalt(10);
                    hash = yield bcrypt_1.default.hash(password, salt);
                }
                const updateUser = yield userModel_js_1.default.findByIdAndUpdate(id, { password: hash, firstName, lastName }, {
                    new: true,
                });
                if (!updateUser) {
                    return res.status(404).json({
                        success: false,
                        message: "Failed to update user",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "User updated successfully",
                    status: 200,
                    data: updateUser,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message || "Failed to update the user",
                    status: 500,
                    data: null,
                });
            }
        });
    }
}
exports.default = UserControllers;
