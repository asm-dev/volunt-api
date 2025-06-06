import cors from "cors";
import express from "express";
import helmet from "helmet";
import { errorHandler } from "./middlewares/error-middleware.js";
import { sanitizeInputs } from "./middlewares/security-middleware.js";
import authRoutes from "./routes/auth-routes.js";
import taskRoutes from "./routes/task-routes.js";
import volunteerRoutes from "./routes/volunteer-routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(sanitizeInputs);

app.use("/auth", authRoutes);
app.use("/tasks", taskRoutes);
app.use("/volunteers", volunteerRoutes);

app.get("/", (req, res) => {
  res.send("Volunt-API en funcionamiento");
});

app.use(errorHandler);

export default app;
