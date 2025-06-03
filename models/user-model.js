import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define("User", {
  username: { type: DataTypes.STRING, unique: true },
  email: { type: DataTypes.STRING, unique: true },
  password: { type: DataTypes.STRING },
});

export default User;
