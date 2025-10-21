import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

// POST /api/new-round
export const newRound = async (req, res) => {
  try {
    const activeRound = await prisma.round.findFirst({ where: { active: true } });
    if (activeRound) return res.status(204).send();

    await prisma.round.create({ data: { active: true } });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/close
export const closeRound = async (req, res) => {
  try {
    const activeRound = await prisma.round.findFirst({ where: { active: true } });
    if (!activeRound) return res.status(204).send();

    await prisma.round.update({
      where: { id: activeRound.id },
      data: { active: false },
    });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// POST /api/store-results
export const storeResults = async (req, res) => {
  const { numbers } = req.body;
  try {
    const round = await prisma.round.findFirst({ orderBy: { createdAt: "desc" } });
    if (!round || round.active || round.numbers) {
      return res.status(400).send();
    }

    await prisma.round.update({
      where: { id: round.id },
      data: { numbers: numbers.join(",") },
    });

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
