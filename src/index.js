import dotenv from "dotenv";
import connectDB from "./db/index.js";

import { app } from "./app.js";

dotenv.config({
  path: "../.env",
});

connectDB()
  .then(() => {
    app.listen(`${process.env.PORT || 3000}`);
    console.log(`server is running at : ${process.env.PORT || 3000}`);
    app.on("ERROR", (error) => {
      console.log("error : ", error);
      throw error;
    });
  })
  .catch((err) => {
    console.log("mongodb connection failed !!", err);
  });
