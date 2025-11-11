import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// In-memory database
let reservations = {}; // key: reservationID

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "static")));
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Helper to generate unique reservation numbers
const generateReservationID = () => "RES" + Math.floor(100000 + Math.random() * 900000);

// ----------------- Customer Routes -----------------
app.get("/", (req, res) => {
  res.render("home");
});

app.post("/create-reservation", (req, res) => {
  const id = generateReservationID();
  const reservation = {
    id,
    name: req.body.name,
    packageInfo: req.body.packageInfo,
    deliveryInfo: req.body.deliveryInfo,
    scheduledTime: req.body.scheduledTime,
    status: "Pending",
    createdAt: new Date(),
    additionalInfo: "",
  };
  reservations[id] = reservation;
  res.redirect(`/reservation/${id}`);
});

app.get("/reservation/:id", (req, res) => {
  const resv = reservations[req.params.id];
  if (!resv) return res.send("Reservation not found");
  res.render("reservation", { reservation: resv });
});

// ----------------- Front Desk Routes -----------------
app.get("/frontdesk", (req, res) => {
  res.render("frontdesk");
});

app.post("/scan-reservation", (req, res) => {
  const id = req.body.reservationID;
  if (!reservations[id]) return res.send("Reservation not found");
  res.redirect(`/frontdesk-reservation/${id}`);
});

app.get("/frontdesk-reservation/:id", (req, res) => {
  const resv = reservations[req.params.id];
  if (!resv) return res.send("Reservation not found");
  res.render("frontdesk-reservation", { reservation: resv });
});

app.post("/update-reservation/:id", (req, res) => {
  const resv = reservations[req.params.id];
  if (!resv) return res.send("Reservation not found");

  // Update editable fields
  resv.name = req.body.name;
  resv.packageInfo = req.body.packageInfo;
  resv.deliveryInfo = req.body.deliveryInfo;
  resv.scheduledTime = req.body.scheduledTime;
  resv.additionalInfo = req.body.additionalInfo || "";

  res.redirect(`/frontdesk-reservation/${req.params.id}`);
});

app.post("/reservation-action/:id", (req, res) => {
  const action = req.body.action;
  const resv = reservations[req.params.id];
  if (!resv) return res.send("Reservation not found");

  if (action === "generate") {
    resv.status = "Generated";
  } else if (action === "delete") {
    delete reservations[req.params.id];
    return res.redirect("/view-all");
  }

  res.redirect(`/frontdesk-reservation/${req.params.id}`);
});

// ----------------- View All Reservations -----------------
app.get("/view-all", (req, res) => {
  res.render("view-all", { reservations: Object.values(reservations) });
});

// ----------------- Start Server -----------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
