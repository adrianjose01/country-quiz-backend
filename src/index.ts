import express from "express";
import UserRoute from "./Routes/UserRouter";
import { connect } from "mongoose";
import cors from "cors";

const app = express();

app.use(cors());

app.use(express.json());

const PORT = process.env.PORT || 3000;
const DB_URL = process.env.DB_CONN_STRING || "";

// ROUTES
app.use("/", UserRoute);

app.listen(PORT, async () => {
  await connect(DB_URL);
  console.log("Server with database running sucessfully!");
});
