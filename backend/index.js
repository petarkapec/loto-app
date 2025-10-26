require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const qrcode = require('qrcode');
const { auth } = require('express-oauth2-jwt-bearer');

const prisma = new PrismaClient();
const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Middleware for machine-to-machine routes (client_credentials)
const m2mAuth = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  audience: process.env.API_AUDIENCE,
  tokenSigningAlg: 'RS256'
});

// Middleware for user routes (OIDC)
const userAuth = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}`,
  audience: process.env.API_AUDIENCE,
  tokenSigningAlg: 'RS256'
});

// Public route: get ticket by id (from QR)
app.get('/ticket/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { round: true }
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    res.json({
      id: ticket.id,
      nationalId: ticket.nationalId,
      numbers: ticket.numbers,
      round: {
        id: ticket.round.id,
        active: ticket.round.active,
        results: ticket.round.results || null
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// User-protected routes using OIDC JWT validation
app.post('/tickets', userAuth, async (req, res) => {
  // Get user info from the validated token
  const userId = req.auth.payload.sub
  const userEmail = req.auth.payload.email
  const { nationalId, numbers } = req.body;
  // Validation
  if (!nationalId || typeof nationalId !== 'string' || nationalId.length === 0 || nationalId.length > 20) {
    return res.status(400).json({ error: 'Broj osobne iskaznice je obavezan i mora imati do 20 znakova.' });
  }
  if (!Array.isArray(numbers) || numbers.length < 6 || numbers.length > 10) {
    return res.status(400).json({ error: 'Morate unijeti 6 do 10 brojeva.' });
  }
  const nums = numbers.map(n => Number(n));
  if (nums.some(n => isNaN(n) || !Number.isInteger(n))) {
    return res.status(400).json({ error: 'Svi brojevi moraju biti cijeli brojevi.' });
  }
  if (nums.some(n => n < 1 || n > 45)) {
    return res.status(400).json({ error: 'Brojevi moraju biti u rasponu od 1 do 45.' });
  }
  const hasDup = new Set(nums).size !== nums.length;
  if (hasDup) return res.status(400).json({ error: 'Brojevi ne smiju imati duplikate.' });

  try {
    // Find active round
    let round = await prisma.round.findFirst({ where: { active: true }, orderBy: { id: 'desc' } });
    if (!round) return res.status(400).json({ error: 'No active round' });

    const ticket = await prisma.ticket.create({
      data: {
        nationalId,
        numbers: nums,
        round: { connect: { id: round.id } },
        userId,
        userEmail
      }
    });

    // Generate QR linking to public ticket page
    const base = process.env.PUBLIC_BASE_URL || `http://localhost:${PORT}`;
    const url = `${base}/ticket/${ticket.id}`;
    const png = await qrcode.toDataURL(url);
    const img = Buffer.from(png.split(',')[1], 'base64');
    res.set('Content-Type', 'application/json');
    res.send(JSON.stringify({
      qr: `data:image/png;base64,${png.split(',')[1]}`,
      link: url
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin/M2M routes
app.post('/new-round', m2mAuth, async (req, res) => {
  try {
    // deactivate existing active rounds
    await prisma.round.updateMany({ where: { active: true }, data: { active: false } });
    await prisma.round.create({ data: { active: true } });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/close', m2mAuth, async (req, res) => {
  try {
    const active = await prisma.round.findFirst({ where: { active: true }, orderBy: { id: 'desc' } });
    if (!active) return res.sendStatus(204);
    await prisma.round.update({ where: { id: active.id }, data: { active: false } });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.post('/store-results', m2mAuth, async (req, res) => {
  try {
    const nums = req.body.numbers;
    if (!Array.isArray(nums) || nums.length === 0) return res.sendStatus(400);
    // Pronađi najnovije kolo (zadnje kreirano)
    const round = await prisma.round.findFirst({ orderBy: { id: 'desc' } });
    if (!round) return res.sendStatus(400);
    // Uplate moraju biti deaktivirane
    if (round.active) return res.sendStatus(400);
    // Rezultati ne smiju biti već pohranjeni
    if (round.results && round.results.length > 0) return res.sendStatus(400);
    // Spremi rezultate
    await prisma.round.update({ where: { id: round.id }, data: { results: nums } });
    res.sendStatus(204);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

app.get('/status', async (req, res) => {
  try {
    const active = await prisma.round.findFirst({ where: { active: true }, orderBy: { id: 'desc' }, include: { tickets: true } });
    if (!active) return res.json({ active: null });
    res.json({
      id: active.id,
      active: active.active,
      ticketsCount: active.tickets ? active.tickets.length : 0,
      results: active.results || null
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
