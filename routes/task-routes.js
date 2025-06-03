import express from "express";
import {
  createTask,
  deleteTask,
  getTasks,
  updateTask,
} from "../controllers/task-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.get("/", getTasks);
router.post("/", authenticate, createTask);
router.put("/:id", authenticate, updateTask);
router.delete("/:id", authenticate, deleteTask);

export default router;
