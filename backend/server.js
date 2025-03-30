import express from "express";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";
import path from "path";
import { exec } from "child_process"; // Import exec for process management
dotenv.config();

const app = express();
const __dirname = path.resolve();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Import routes
import productRoutes from "./routes/product.route.js";
app.use("/api/products", productRoutes);

// Serve static files in production
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "/frontend/dist")));
    app.get("*", (req, res) => {
        res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
    });
}

// Function to kill any process using the port
const killPort = (port) => {
    return new Promise((resolve, reject) => {
        const command = process.platform === "win32"
            ? `netstat -ano | findstr :${port}`
            : `lsof -t -i:${port}`;

        exec(command, (err, stdout) => {
            if (err || !stdout) {
                console.log(`✅ No process found on port ${port}, starting server...`);
                return resolve();
            }

            // Extract process ID (PID)
            const pid = process.platform === "win32"
                ? stdout.trim().split(/\s+/).pop()
                : stdout.trim();

            console.log(`⚠ Killing process on port ${port} (PID: ${pid})...`);

            const killCommand = process.platform === "win32"
                ? `taskkill /PID ${pid} /F`
                : `kill -9 ${pid}`;

            exec(killCommand, (killErr) => {
                if (killErr) return reject(`❌ Failed to kill process: ${killErr}`);
                console.log(`✅ Successfully killed process ${pid} on port ${port}`);
                resolve();
            });
        });
    });
};

// Start the server after killing process on the port
const startServer = async () => {
    try {
        await killPort(PORT); // Ensure the port is free
        app.listen(PORT, () => {
            connectDB();
            console.log(`🚀 Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("❌ Error starting server:", error);
    }
};

startServer();
