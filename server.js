import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const __dirname = path.resolve();
const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Simple JSON storage
const DATA_FILE = './data.json';
const loadData = () => {
    if (!fs.existsSync(DATA_FILE)) return [];
    const data = fs.readFileSync(DATA_FILE);
    return JSON.parse(data);
};
const saveData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

// ===== ROUTES ===== //

// Reservation Form
app.get('/', (req, res) => {
    res.render('index');
});

// Handle form submission
app.post('/reserve', (req, res) => {
    const { sender, recipient, contents, time } = req.body;
    const id = uuidv4().slice(0, 8).toUpperCase(); // Short reservation ID
    const reservation = {
        id,
        sender,
        recipient,
        contents,
        time,
        status: 'reserved',
        notes: ''
    };
    const data = loadData();
    data.push(reservation);
    saveData(data);
    res.redirect(`/reservation/${id}`);
});

// Reservation / Tracking Page
app.get('/reservation/:id', (req, res) => {
    const data = loadData();
    const reservation = data.find(r => r.id === req.params.id);
    if (!reservation) return res.send('Reservation not found');
    res.render('reservation', { reservation });
});

// Front Desk Page
app.get('/frontdesk', (req, res) => {
    const data = loadData();
    res.render('frontdesk', { reservations: data });
});

// Handle Front Desk Updates
app.post('/frontdesk/:id', (req, res) => {
    const { status, notes } = req.body;
    const data = loadData();
    const reservation = data.find(r => r.id === req.params.id);
    if (!reservation) return res.send('Reservation not found');
    reservation.status = status || reservation.status;
    reservation.notes = notes || reservation.notes;
    saveData(data);
    res.redirect('/frontdesk');
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
