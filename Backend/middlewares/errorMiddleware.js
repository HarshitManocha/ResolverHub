import env from "../config/env.js";

export const notFoundHandler = (req, res) => {
	res.status(404).json({
		success: false,
		message: `Route not found: ${req.method} ${req.originalUrl}`,
	});
};

const translate = (error) => {
	if (error?.statusCode) {
		return { status: error.statusCode, message: error.message };
	}

	if (error?.name === "ValidationError") {
		const details = Object.values(error.errors ?? {})
			.map((field) => field.message)
			.join(", ");
		return { status: 400, message: details || "Validation failed" };
	}

	if (error?.name === "CastError") {
		return { status: 400, message: `Invalid ${error.path}: ${error.value}` };
	}

	if (error?.code === 11000) {
		const field = Object.keys(error.keyPattern ?? { value: 1 })[0];
		return { status: 409, message: `${field} is already in use` };
	}

	return { status: 500, message: "Something went wrong on the server" };
};

// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by arity.
export const errorHandler = (error, req, res, next) => {
	const { status, message } = translate(error);

	if (status >= 500) {
		console.error(`${req.method} ${req.originalUrl} failed:`, error);
	}

	res.status(status).json({
		success: false,
		message,
		...(env.nodeEnv === "development" && status >= 500
			? { stack: error?.stack }
			: {}),
	});
};
