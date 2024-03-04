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
const addressModel_js_1 = __importDefault(require("../Models/addressModel.js"));
const userModel_js_1 = __importDefault(require("../Models/userModel.js"));
const mongoose_1 = __importDefault(require("mongoose"));
class AddressControllers {
    //add address to user
    static createAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { country, city, postalCode, details, phone } = req.body;
            const userId = req.params.userId;
            try {
                const user = yield userModel_js_1.default.findById(userId);
                if (!user) {
                    return res.status(404).json({
                        success: false,
                        message: "User not found",
                        status: 404,
                        data: null,
                    });
                }
                if (!country || !city || !postalCode || !details || !phone) {
                    return res.status(400).json({
                        success: false,
                        message: "all fields are required",
                        status: 400,
                        data: null,
                    });
                }
                const newAddress = new addressModel_js_1.default(Object.assign(Object.assign({}, req.body), { user: userId }));
                yield newAddress.save();
                user.addresses.push(newAddress._id);
                yield user.save();
                return res.status(201).json({
                    success: true,
                    message: "Address added successfully",
                    status: 201,
                    data: newAddress,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to create address",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //get all addresses
    static getAllAddresses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const addresses = yield addressModel_js_1.default.find({}).populate({
                    path: "user",
                    select: "firstName lastName email", // Only include these fields
                });
                return res.status(200).json({
                    success: true,
                    message: "Addresses retrieved successfully",
                    status: 200,
                    data: addresses,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive addresses",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //get address by id
    static getAddressById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const address = yield addressModel_js_1.default.findById(id).populate({
                    path: "user",
                    select: "firstName lastName email", // Only include these fields
                });
                if (!address) {
                    return res.status(404).json({
                        success: false,
                        message: "address not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: false,
                    message: "address retreived successfully",
                    status: 200,
                    data: address,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "failed to retreive address",
                    status: 500,
                    data: error.message,
                });
            }
        });
    }
    //delete address
    static deleteAdrress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                const address = yield addressModel_js_1.default.findByIdAndDelete(id);
                if (!address) {
                    return res.status(404).json({
                        success: false,
                        message: "Address not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Address deleted successfully",
                    status: 200,
                    data: address,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to delete the address",
                    status: 500,
                    data: null,
                });
            }
        });
    }
    //edit address
    static editAddress(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
                return res.status(404).json({ error: "Not valid id format" });
            }
            try {
                let address = yield addressModel_js_1.default.findByIdAndUpdate(id, Object.assign({}, req.body), { new: true });
                if (!address) {
                    return res.status(404).json({
                        success: false,
                        message: "Address not found",
                        status: 404,
                        data: null,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Address updated successfully",
                    status: 200,
                    data: address,
                });
            }
            catch (error) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to update the address",
                    status: 500,
                    data: null,
                });
            }
        });
    }
}
exports.default = AddressControllers;
