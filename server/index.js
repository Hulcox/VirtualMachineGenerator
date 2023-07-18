import express from "express";
import cors from "cors";
import "dotenv/config";
import morgan from "morgan";
import route from "./src/route.js";
import sqlite3 from "sqlite3";

const app = express();
const port = process.env.SERVER_PORT;

app.options("*", cors({ origin: "*", optionsSuccessStatus: 200 }));

app.use(cors({ origin: "*", optionsSuccessStatus: 200 }));
app.use(morgan("dev"));
app.use(express.json());

const db = new sqlite3.Database("./database/astrocloud.db", (err) => {
  if (err) {
    console.error(
      "Erreur lors de la connexion à la base de données :",
      err.message
    );
  } else {
    console.log("Connecté à la base de données SQLite");
  }
});

route({ app, db });

app.listen(port, () => console.log(`🎉 Listening on :${port}`));
