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

// Simple in-memory "database"
const reservations = {};

// Homepage - customer creates reservation
app.get("/", (req, res) => {
  res.render("homepage");
});

app.post("/create-reservation", (req, res) => {
  const id = "RES" + Date.now();
  const { name, packageDetails } = req.body;

  // Set reservation expiry time (5 minutes by default)
  const expiresAt = Date.now() + 5 * 60 * 1000;

  reservations[id] = {
    id,
    name,
    packageDetails,
    status: "Pending",
    expiresAt,
    additionalInfo: ""
  };
  res.redirect(`/reservation/${id}`);
});

// Customer reservation page
app.get("/reservation/:id", (req, res) => {
  const reservation = reservations[req.params.id];
  if (!reservation) return res.send("Reservation not found");
  res.render("reservation", { reservation });
});

// Front desk page
app.get("/frontdesk", (req, res) => {
  res.render("frontdesk");
});

// Scan reservation (POST from frontdesk)
app.post("/scan-reservation", (req, res) => {
  const { reservationId, additionalInfo } = req.body;
  const reservation = reservations[reservationId];
  if (!reservation) return res.send("Reservation not found");

  if (additionalInfo) {
    reservation.additionalInfo = additionalInfo;
  }

  res.render("frontdesk-reservation", { reservation });
});

// All reservations page (accessible from front desk button)
app.get("/all-reservations", (req, res) => {
  res.render("all-reservations", { reservations: Object.values(reservations) });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
