import express from "express";
import cors, { CorsOptions } from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "../Routes/userRoutes.js";
import adminRoute from "../Routes/adminRoutes.js";
import categoryRoute from "../Routes/categoryRoutes.js";
import addressRoute from "../Routes/addressRoutes.js";
import subcategoryRoute from "../Routes/subcategoryRoutes.js";
import collectionRoute from "../Routes/collectionRoutes.js";
import productRoute from "../Routes/productRoutes.js";
import wishlistRoute from "../Routes/wishlistRoutes.js";
import charityRoute from "../Routes/charityRoutes.js";
import { Request, Response, NextFunction } from "express";
dotenv.config();

//express app
const app = express();

//define cors options in typescript
const corsOptions: CorsOptions = {
  origin: "*",
};

//middlewares
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: false })); //parse form data
app.use(express.json()); //parse json data
app.use(cors(corsOptions));
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use((req, res, next) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "*");
  next();
});
//endpoints
app.use("/api/admin", adminRoute);
app.use("/api/user", userRoute);
app.use("/api/address", addressRoute);
app.use("/api/category", categoryRoute);
app.use("/api/subcategory", subcategoryRoute);
app.use("/api/collection", collectionRoute);
app.use("/api/product", productRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/charity", charityRoute);

// Add this after all your routes
adminRoute.use(
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack); // Log the error stack trace
    res.status(500).json({
      success: false,
      message: "An error occurred",
      error: err.message,
    });
  }
);
//connect to database
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("connected to db & listening on port ", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB: ", error);
  });
