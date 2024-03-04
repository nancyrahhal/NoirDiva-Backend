"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_js_1 = __importDefault(require("../Routes/userRoutes.js"));
const adminRoutes_js_1 = __importDefault(require("../Routes/adminRoutes.js"));
const categoryRoutes_js_1 = __importDefault(require("../Routes/categoryRoutes.js"));
const addressRoutes_js_1 = __importDefault(require("../Routes/addressRoutes.js"));
const subcategoryRoutes_js_1 = __importDefault(require("../Routes/subcategoryRoutes.js"));
const collectionRoutes_js_1 = __importDefault(require("../Routes/collectionRoutes.js"));
const productRoutes_js_1 = __importDefault(require("../Routes/productRoutes.js"));
const wishlistRoutes_js_1 = __importDefault(require("../Routes/wishlistRoutes.js"));
const charityRoutes_js_1 = __importDefault(require("../Routes/charityRoutes.js"));
dotenv_1.default.config();
//express app
const app = (0, express_1.default)();
//define cors options in typescript
const corsOptions = {
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
};
//middlewares
app.use(express_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.urlencoded({ extended: false })); //parse form data
app.use(express_1.default.json()); //parse json data
app.use((0, cors_1.default)(corsOptions));
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});
//endpoints
app.use("/api/admin", adminRoutes_js_1.default);
app.use("/api/user", userRoutes_js_1.default);
app.use("/api/address", addressRoutes_js_1.default);
app.use("/api/category", categoryRoutes_js_1.default);
app.use("/api/subcategory", subcategoryRoutes_js_1.default);
app.use("/api/collection", collectionRoutes_js_1.default);
app.use("/api/product", productRoutes_js_1.default);
app.use("/api/wishlist", wishlistRoutes_js_1.default);
app.use("/api/charity", charityRoutes_js_1.default);
// Add this after all your routes
adminRoutes_js_1.default.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({
        success: false,
        message: "An error occurred",
        error: err.message,
    });
});
//connect to database
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => {
    app.listen(process.env.PORT, () => {
        console.log("connected to db & listening on port ", process.env.PORT);
    });
})
    .catch((error) => {
    console.log("Error connecting to MongoDB: ", error);
});
