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
app.get("/", (req, res) => res.render("homepage"));

app.post("/create-reservation", (req, res) => {
  const id = "RES" + Date.now();
  const {
    name,
    packageDetails,
    contact,
    deliveryAddress,
    notes,
    fragile,
    value
  } = req.body;

  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 min countdown for example

  reservations[id] = {
    id,
    name,
    packageDetails,
    contact,
    deliveryAddress,
    notes,
    fragile,
    value,
    status: "Pending",
    expiresAt,
    additionalInfo: ""
  };

  res.redirect(`/reservation/${id}`);
});

// Customer reservation page (tracking)
app.get("/reservation/:id", (req, res) => {
  const reservation = reservations[req.params.id];
  if (!reservation) return res.send("Reservation not found");
  res.render("reservation", { reservation });
});

// Front desk page
app.get("/frontdesk", (req, res) => res.render("frontdesk"));

// Scan / lookup reservation
app.post("/scan-reservation", (req, res) => {
  const { reservationId } = req.body;
  const reservation = reservations[reservationId];
  if (!reservation) return res.send("Reservation not found");
  res.render("frontdesk-reservation", { reservation });
});

// Update additional info only
app.post("/update-reservation/:id", (req, res) => {
  const reservation = reservations[req.params.id];
  if (!reservation) return res.send("Reservation not found");

  reservation.additionalInfo = req.body.additionalInfo || "";
  res.redirect(`/frontdesk-reservation/${reservation.id}`);
});

// Generate or delete reservation
app.post("/reservation-action/:id", (req, res) => {
  const reservation = reservations[req.params.id];
  if (!reservation) return res.send("Reservation not found");

  const { action } = req.body;
  if (action === "delete") delete reservations[req.params.id];
  if (action === "generate") reservation.status = "Generated";

  res.redirect("/frontdesk");
});

// Front desk reservation view
app.get("/frontdesk-reservation/:id", (req, res) => {
  const reservation = reservations[req.params.id];
  if (!reservation) return res.send("Reservation not found");
  res.render("frontdesk-reservation", { reservation });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
