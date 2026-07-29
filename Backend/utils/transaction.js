import mongoose from "mongoose";

// Multi document transactions need a replica set or mongos. A standalone mongod
// (the default for a local install) rejects them, so we detect that once and
// fall back to running the same work without a session.
let transactionsSupported = null;

/**
 * Asks the server what it is instead of waiting for a write to fail, so a
 * standalone deployment never produces a half attempted transaction.
 */
const detectTransactionSupport = async () => {
	if (transactionsSupported !== null) return transactionsSupported;

	try {
		const info = await mongoose.connection.db.admin().command({ hello: 1 });
		// setName means replica set; "isdbgrid" means we are talking to mongos.
		transactionsSupported = Boolean(info.setName) || info.msg === "isdbgrid";
	} catch {
		transactionsSupported = false;
	}

	if (!transactionsSupported) {
		console.warn(
			"MongoDB deployment does not support transactions - writes will run " +
				"without one. Use a replica set or Atlas for atomic multi document writes.",
		);
	}

	return transactionsSupported;
};

/** Mongo wraps the real cause, so the whole chain has to be inspected. */
const errorChain = (error) => {
	const chain = [];
	let current = error;

	while (current && chain.length < 5) {
		chain.push(current);
		current = current.originalError ?? current.cause;
	}

	return chain;
};

const isUnsupportedError = (error) =>
	errorChain(error).some(
		(link) =>
			link.code === 20 ||
			link.codeName === "IllegalOperation" ||
			/Transaction numbers are only allowed on a replica set member or mongos/i.test(
				link.message ?? "",
			) ||
			/Transactions are not supported/i.test(link.message ?? "") ||
			/does not support retryable writes/i.test(link.message ?? ""),
	);

/**
 * Runs `work` inside a transaction when the deployment supports it.
 * `work` receives the options object to forward to repository calls,
 * i.e. `{ session }` or `{}`.
 */
export const runInTransaction = async (work) => {
	if (!(await detectTransactionSupport())) {
		return work({});
	}

	const session = await mongoose.startSession();

	try {
		let result;
		await session.withTransaction(async () => {
			result = await work({ session });
		});
		return result;
	} catch (error) {
		if (isUnsupportedError(error)) {
			transactionsSupported = false;
			console.warn(
				"Transaction rejected by the server - retrying without one. " +
					"Use a replica set or Atlas for atomic multi document writes.",
			);
			return work({});
		}
		throw error;
	} finally {
		await session.endSession();
	}
};

export default runInTransaction;
