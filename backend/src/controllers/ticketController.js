import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";
import QRCode from "qrcode";

const prisma = new PrismaClient();

// POST /api/tickets
export const createTicket = async (req, res) => {
  const { document, numbers } = req.body;

  // Validacija podataka
  const nums = numbers.split(",").map(n => parseInt(n.trim(), 10));
  const uniqueNums = [...new Set(nums)];

  if (
    !document ||
    document.length > 20 ||
    uniqueNums.length < 6 ||
    uniqueNums.length > 10 ||
    uniqueNums.some(n => n < 1 || n > 45)
  ) {
    return res.status(400).json({ error: "Neispravni podaci" });
  }

  const round = await prisma.round.findFirst({ where: { active: true } });
  if (!round) return res.status(400).json({ error: "Uplate nisu aktivne" });

  const ticketId = uuidv4();

  const ticket = await prisma.ticket.create({
    data: {
      id: ticketId,
      document,
      numbers: uniqueNums.join(","),
      roundId: round.id,
    },
  });

  const qrData = `${process.env.FRONTEND_URL}/ticket/${ticketId}`;
  const qrImage = await QRCode.toDataURL(qrData);

  const img = Buffer.from(qrImage.split(",")[1], "base64");
  res.writeHead(200, { "Content-Type": "image/png" });
  res.end(img);
};
