import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Task = sequelize.define("Task", {
  title: DataTypes.STRING,
  description: DataTypes.TEXT,
  category: DataTypes.STRING,
  status: {
    type: DataTypes.ENUM("open", "in_progress", "completed"),
    defaultValue: "open",
  },
  deadline: DataTypes.DATE,
  createdBy: DataTypes.INTEGER,
});

export default Task;
