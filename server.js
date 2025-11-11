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

// In-memory database
const reservations = {};

// Homepage - create reservation
app.get("/", (req, res) => {
  res.render("homepage");
});

app.post("/create-reservation", (req, res) => {
  const id = "RES" + Date.now();
  const {
    name,
    packageDetails,
    contact,
    deliveryAddress,
    notes,
    fragile,
    value,
    suspicious
  } = req.body;

  const expiresAt = Date.now() + 5 * 60 * 1000;

  reservations[id] = {
    id,
    name,
    packageDetails,
    contact,
    deliveryAddress,
    notes,
    fragile,
    value,
    suspicious: suspicious || "",
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

// Front desk
app.get("/frontdesk", (req, res) => {
  res.render("frontdesk");
});

// Scan/lookup reservation
app.post("/scan-reservation", (req, res) => {
  const { reservationId } = req.body;
  const reservation = reservations[reservationId];
  if (!reservation) return res.send("Reservation not found");
  res.render("frontdesk-reservation", { reservation });
});

// Update reservation from Front Desk
app.post("/update-reservation/:id", (req, res) => {
  const reservation = reservations[req.params.id];
  if (!reservation) return res.send("Reservation not found");

  Object.assign(reservation, req.body); // Update fields dynamically
  res.redirect(`/frontdesk-reservation/${reservation.id}`);
});

// Front desk page for specific reservation
app.get("/frontdesk-reservation/:id", (req, res) => {
  const reservation = reservations[req.params.id];
  if (!reservation) return res.send("Reservation not found");
  res.render("frontdesk-reservation", { reservation });
});

// All reservations (view & actions)
app.get("/all-reservations", (req, res) => {
  res.render("all-reservations", { reservations: Object.values(reservations) });
});

// Perform actions on reservations (delay, cancel, mark early)
app.post("/reservation-action/:id", (req, res) => {
  const reservation = reservations[req.params.id];
  if (!reservation) return res.send("Reservation not found");

  const { action } = req.body;
  switch(action) {
    case "cancel": reservation.status = "Cancelled"; break;
    case "delay": reservation.expiresAt += 5 * 60 * 1000; break; // add 5 mins
    case "early": reservation.expiresAt = Date.now(); break;
    case "suspicious": reservation.suspicious = "Marked suspicious"; break;
  }
  res.redirect("/all-reservations");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
