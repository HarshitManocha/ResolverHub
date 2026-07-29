import dns from "node:dns";
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(currentDir, "..");
const repoRoot = path.resolve(backendRoot, "..");

// Repo-root .env is the shared default; Backend/.env overrides it for local tweaks.
dotenv.config({ path: path.join(repoRoot, ".env") });
dotenv.config({ path: path.join(backendRoot, ".env"), override: true });

// Some ISPs fail to resolve MongoDB Atlas SRV records. Set DNS_SERVERS=system to
// opt out, or to a comma separated list of resolvers to use your own.
const dnsSetting = process.env.DNS_SERVERS ?? "8.8.8.8,8.8.4.4";
if (dnsSetting !== "system") {
	const servers = dnsSetting
		.split(",")
		.map((server) => server.trim())
		.filter(Boolean);

	if (servers.length > 0) {
		dns.setServers(servers);
	}
}

const missing = ["MONGODB_URI", "JWT_SECRET"].filter((key) => !process.env[key]);

if (missing.length > 0) {
	console.error(
		`Missing required environment variables: ${missing.join(", ")}.\n` +
			`Copy .env.example to .env in the project root and fill in the values.`,
	);
	process.exit(1);
}

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
	clientOrigins: parseList(
		process.env.CLIENT_ORIGIN,
		"http://localhost:5173,http://localhost:4173",
	),
};

export default env;
