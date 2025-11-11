import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory "database" for reservations
const reservations = {};

// Front desk page to create reservation
app.get("/frontdesk", (req, res) => {
  res.render("frontdesk");
});

app.post("/create-reservation", (req, res) => {
  const id = "RES" + Date.now(); // simple unique ID
  const { name, packageDetails } = req.body;
  reservations[id] = { id, name, packageDetails, status: "Pending" };
  res.redirect(`/reservation/${id}`);
});

// Reservation tracking page
app.get("/reservation/:id", (req, res) => {
  const reservation = reservations[req.params.id];
  if (!reservation) return res.send("Reservation not found");
  res.render("reservation", { reservation });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
