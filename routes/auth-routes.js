import express from "express";
import { body } from "express-validator";
import { login, register } from "../controllers/auth-controller.js";
import { validate } from "../middlewares/validation-middleware.js";

const router = express.Router();

router.post(
  "/register",
  body("email").isEmail(),
  body("password").isLength({ min: 6 }),
  validate,
  register
);

router.post("/login", login);

export default router;
