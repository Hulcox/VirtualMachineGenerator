import { DateTime } from "luxon";
import { StartAndStopAzureVm } from "./azure.js";
import { generateToken, verifyToken } from "./tools/token.js";
import "dotenv/config";

const route = ({ app, db }) => {
  app.post("/api/login", async (req, res) => {
    db.get(
      "SELECT * FROM users WHERE email = ?",
      [req.body.email],
      (err, rows) => {
        if (err) {
          console.error(
            "Erreur lors de la récupération des utilisateurs :",
            err.message
          );
          res.status(500).send("Erreur du serveur");
        } else {
          if (!rows) {
            res.status(404).send("Pas d'utilisateur");
          } else {
            if (rows.password === req.body.password) {
              const token = generateToken(
                { id: rows.id, name: rows.name, credit: rows.credit },
                process.env.SECRET_TOKEN,
                "12h"
              );
              res.json({ token: token, user: rows });
            } else {
              res.status(404).send("Email ou mot de passe incorrect");
            }
          }
        }
      }
    );
  });

  app.get("/api/auth/:token", async (req, res) => {
    try {
      verifyToken(req.params.token, process.env.SECRET_TOKEN);
      res.sendStatus(200);
    } catch (error) {
      res.sendStatus(400);
    }
  });

  app.get("/api/allMachine/:user", async (req, res) => {
    try {
      db.all(
        "SELECT * FROM machine WHERE id_user = ?",
        [req.params.user],
        (err, rows) => {
          if (err) {
            console.error(
              "Erreur lors de la récupération des machines :",
              err.message
            );
            res.status(500).send("Erreur du serveur");
          } else {
            if (!rows) {
              res.status(404).send("Pas de machine");
            } else {
              res.status(200).send(rows);
            }
          }
        }
      );
    } catch (error) {
      res.sendStatus(400);
    }
  });

  app.post("/api/createVm", async (req, res) => {
    try {
      const { publisher, offer, sku, userId } = req.body;

      StartAndStopAzureVm(publisher, offer, sku)
        .then((result) => {
          const insert = db.prepare(
            "INSERT INTO machine (name, uptime, active, created_at, id_user) VALUES (?, ?, ?, ?, ?)"
          );

          insert.run(
            result.ip,
            Number(process.env.DELETE_TIME),
            true,
            DateTime.fromISO(result.deletingAt).toSQL(),
            userId
          );

          res.status(200).send(result);
        })
        .catch((error) => {
          res.sendStatus(400);
        });
    } catch (error) {
      res.status(400).send(error.message);
    }
  });
};

export default route;
