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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const adminModel_js_1 = __importDefault(require("../Models/adminModel.js"));
const protectAdmin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const headerInput = req.headers["authorization"];
    const token = headerInput && headerInput.split(" ")[1];
    if (token == null) {
        return res.status(401).json("not authorized");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        const admin = yield adminModel_js_1.default.findById(decoded._id);
        req.admin = admin;
        if (!req.admin) {
            return res.status(404).json("user not found");
        }
        next();
    }
    catch (error) {
        return res.status(401).json("invalid token");
    }
});
exports.default = protectAdmin;
