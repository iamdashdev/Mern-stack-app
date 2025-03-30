import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

import productRoutes from "./routes/product.route.js";

dotenv.config();
const app = express();

// Set up middleware to parse the request body as JSON
app.use(express.json());

app.use("/api/products", productRoutes)


app.listen(process.env.PORT || 5000, () =>{
    connectDB();
    console.log("Server is running on http://localhost:5000");
})