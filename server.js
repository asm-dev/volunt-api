import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import sequelize from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conectado a PostgreSQL");

    await sequelize.sync({ alter: true });
    console.log("Tablas sincronizadas");

    await mongoose.connect(MONGO_URI);
    console.log("Conectado a MongoDB");

    app.listen(PORT, () => {
      console.log(`Servidor en ejecución.`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

startServer();
