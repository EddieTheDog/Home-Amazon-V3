import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import QRCode from "qrcode";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 10000;

// Middlewares
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// In-memory "database" for demo purposes
const reservations = {};

// Routes

// 1. Reservation form
app.get("/", (req, res) => {
  res.render("index");
});

// 2. Handle form submission
app.post("/reserve", async (req, res) => {
  const { name, contents } = req.body;
  const id = Date.now().toString(36); // unique short ID
  reservations[id] = { name, contents, status: "Pending" };

  // Generate QR code data URL
  const qrData = await QRCode.toDataURL(id);
  reservations[id].qr = qrData;

  res.redirect(`/reservation/${id}`);
});

// 3. Reservation page / tracking
app.get("/reservation/:id", (req, res) => {
  const { id } = req.params;
  const reservation = reservations[id];
  if (!reservation) return res.send("Reservation not found");
  res.render("reservation", { id, reservation });
});

// 4. Front Desk page
app.get("/frontdesk", (req, res) => {
  res.render("frontdesk", { reservations });
});

// 5. Update reservation status (Front Desk)
app.post("/update/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (reservations[id]) reservations[id].status = status;
  res.redirect("/frontdesk");
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
