import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const sequelize = new Sequelize(process.env.POSTGRES_URI, {
  logging: false, // Cambiar a true si se quiere ver las consultas SQL
});

export default sequelize;
