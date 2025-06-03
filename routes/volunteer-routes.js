import express from "express";
import {
  getVolunteersByTask,
  registerVolunteer,
} from "../controllers/volunteer-controller.js";
import { authenticate } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.post("/", authenticate, registerVolunteer);
router.get("/:taskId", getVolunteersByTask);

export default router;
