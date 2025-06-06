import dotenv from "dotenv";
import { Sequelize } from "sequelize";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  dotenv.config();
}

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  protocol: "postgres",
  logging: false,
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

export default sequelize;
