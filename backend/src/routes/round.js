import { Router } from "express";
const router = Router();

router.post("/new-round", (req, res) => res.status(204).send());
router.post("/close", (req, res) => res.status(204).send());
router.post("/store-results", (req, res) => res.status(204).send());

export default router;
