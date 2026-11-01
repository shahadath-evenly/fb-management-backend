import cors from "cors";
import express from "express";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import { notFoundMiddleware } from "./middlewares/not-found.middleware.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";

const app = express();

// app.use(cors({ origin: env.frontendUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
