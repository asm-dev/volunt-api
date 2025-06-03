import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user-model.js";

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);

    const user = await User.create({ username, email, password: hash });

    res.status(201).json({ id: user.id, username, email });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    next(err);
  }
};
