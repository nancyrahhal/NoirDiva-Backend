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
const adminModel_js_1 = __importDefault(require("../Models/adminModel.js"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
dotenv_1.default.config();
const createToken = (_id) => {
    return jsonwebtoken_1.default.sign({ _id }, process.env.SECRET, { expiresIn: "1d" });
};
class AdminControllers {
    //admin create
    static adminsignup(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { username, password } = req.body;
            // const image=req.file as Express.Multer.File
            try {
                const newAdmin = yield adminModel_js_1.default.signup(username, password
                //  image
                );
                const token = createToken(newAdmin._id);
                return res.status(200).json({
                    success: true,
                    message: "Account successfully created",
                    status: 200,
                    data: newAdmin,
                    token,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to create admin",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //admin login
    static adminLogin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { username, password } = req.body;
            try {
                const admin = yield adminModel_js_1.default.login(username, password);
                const token = createToken(admin._id);
                return res.status(200).json({
                    success: true,
                    message: "You are logged in!",
                    status: 200,
                    data: admin,
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
    //get all admins
    static getAllAdmins(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const admins = yield adminModel_js_1.default.find({})
                    .sort({ createdAt: -1 })
                    .select("-password");
                return res.status(200).json({
                    success: true,
                    message: "Admins retrieved successfully",
                    status: 200,
                    data: admins,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to retrieve admins",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //get admin by id
    static getAdminById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const admin = yield adminModel_js_1.default.findById(id).select("-password");
                if (!admin) {
                    return res.status(404).json({
                        success: false,
                        message: "Admin not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Admin retrieved successfully",
                    status: 200,
                    data: admin,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to retrieve the requested admin",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //delete admin
    static deleteAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const deletedAdmin = yield adminModel_js_1.default.findByIdAndDelete(id).select("-password");
                if (!deletedAdmin) {
                    return res.status(404).json({
                        success: false,
                        message: "Admin not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Admin deleted successfully",
                    status: 200,
                    data: deletedAdmin,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete the admin",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //update admin
    static updateAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { username } = req.body;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                //check if admin exists to edit
                const existingAdmin = yield adminModel_js_1.default.findById(id);
                if (!existingAdmin) {
                    return res.status(404).json({
                        success: false,
                        message: "Admin not found",
                        status: 404,
                        data: null,
                    });
                }
                //check username if exists
                const existUsername = yield adminModel_js_1.default.findOne({ username });
                if (existUsername) {
                    return res.status(500).json({
                        success: false,
                        message: "username already in use",
                        status: 500,
                        data: null,
                    });
                }
                const updateAdmin = yield adminModel_js_1.default.findByIdAndUpdate(id, req.body, {
                    new: true,
                });
                if (!updateAdmin) {
                    return res.status(404).json({
                        success: false,
                        message: "Failed to update admin",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Admin updated successfully",
                    status: 200,
                    data: updateAdmin,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: error.message || "Failed to update the Admin",
                    status: 500,
                    data: null,
                });
            }
        });
    }
}
exports.default = AdminControllers;
