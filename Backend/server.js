import cors from "cors";
import express from "express";
import mongoose from "mongoose";

import env from "./config/env.js";
import {
	errorHandler,
	notFoundHandler,
} from "./middlewares/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import bugRoutes from "./routes/bugRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
	res.json({
		success: true,
		status: "ok",
		database:
			mongoose.connection.readyState === 1 ? "connected" : "disconnected",
	});
});

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/bugs", bugRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/summary", aiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const connectDB = async () => {
	try {
		await mongoose.connect(env.mongoUri, {
			serverSelectionTimeoutMS: 15000,
		});
		console.log("MongoDB connected");
	} catch (error) {
		console.error("Failed to connect to MongoDB:", error.message);
		process.exit(1);
	}
};

await connectDB();

app.listen(env.port, () => {
	console.log(`Server listening on http://localhost:${env.port}`);
});
