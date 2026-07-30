import dns from "node:dns";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const parseList = (value, fallback) =>
	(value ?? fallback)
		.split(",")
		.map((entry) => entry.trim())
		.filter(Boolean);

const env = {
	nodeEnv: process.env.NODE_ENV ?? "development",
	port: Number(process.env.PORT) || 5000,
	mongoUri: process.env.MONGODB_URI,
	jwtSecret: process.env.JWT_SECRET,
	jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "24h",
	// clientOrigins: parseList(
	// 	process.env.CLIENT_ORIGIN,
	// 	"http://localhost:5173,http://localhost:4173",
	// ),
};

export default env;
