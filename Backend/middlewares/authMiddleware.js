import jwt from "jsonwebtoken";

import env from "../config/env.js";
import { unauthorized } from "../utils/appError.js";

const protect = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader?.startsWith("Bearer ")) {
		return next(unauthorized("Authentication token missing"));
	}

	const token = authHeader.slice("Bearer ".length).trim();

	try {
		const decoded = jwt.verify(token, env.jwtSecret);
		req.id = decoded.userId;
		return next();
	} catch {
		return next(unauthorized("Invalid token or token expired"));
	}
};

export default protect;
