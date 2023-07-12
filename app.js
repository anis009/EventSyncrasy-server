import express from "express";
import mongoose from "mongoose";
import bluebird from "bluebird";
import bodyParser from "body-parser";
import config from "./config/index.js";
import authRouter from "./routes/auth.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import httpStatus from "http-status";
import { ApiError } from "./errors/ApiError.js";
import colors from "colors";
import morgan from "morgan";
import { customerRoute } from "./routes/customer.js";
const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
if (config.NODE_ENV === "DEV") {
	app.use(morgan("dev"));
}

// Connect to MongoDB
mongoose.Promise = bluebird;

const mongooseOptions = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
};

await mongoose.connect(config.MONGODB_URI, mongooseOptions);
console.log("Mongoose connected to MongoDB".green.underline);

// CORs Handling
app.use((req, res, next) => {
	const allowedOrigins = [
		//'http://127.0.0.1:5001', 'http://localhost:8001', 'http://127.0.0.1:8002',
		"*",
		req.headers.origin,
	]; // all origin accepted initillay
	const origin = req.headers.origin || "";
	if (allowedOrigins.includes(origin)) {
		res.setHeader("Access-Control-Allow-Origin", origin);
	}

	res.header("Access-Control-Allow-Methods", "GET, PUT, DELETE, OPTIONS");
	res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
	res.header("Access-Control-Allow-Credentials", "true");

	if (req.method === "OPTIONS") {
		return res.status(200).end();
	}

	return next();
});

app.use("/api/auth", authRouter);
app.use("/api/customer", customerRoute);

app.get("/", async (req, res, next) => {
	res.send("Hello, " + req);
});

app.post(
	("/test",
	async (req, res) => {
		console.log("req.body: ", req.body);
		res.json({
			success: true,
		});
	})
);

app.use(globalErrorHandler);

app.use((req, res, next) => {
	res.status(httpStatus.NOT_FOUND).json({
		success: false,
		message: "Not Found",
		errorMessages: [
			{
				path: req.originalUrl,
				message: "Api Not Found",
			},
		],
	});
	//next();
});

export default app;
