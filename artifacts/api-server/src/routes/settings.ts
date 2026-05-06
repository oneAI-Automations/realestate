import { Router, type IRouter } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import {
  UpdateSpecialOfferBody,
  GetSpecialOfferResponse,
  UpdateSpecialOfferResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function ensureSettings() {
  const existing = await db.select().from(siteSettingsTable).limit(1);
  if (existing.length === 0) {
    await db.insert(siteSettingsTable).values({
      text: "🏆 Exclusive Launch Offer — Limited Units Available in Pune's Most Prestigious Development | ✨ Register Now for Priority Access",
    });
  }
  return db.select().from(siteSettingsTable).limit(1).then((r) => r[0]);
}

router.get("/settings/special-offer", async (_req, res): Promise<void> => {
  const setting = await ensureSettings();
  if (!setting) {
    res.status(500).json({ error: "Settings not found" });
    return;
  }
  res.json(
    GetSpecialOfferResponse.parse({
      id: setting.id,
      text: setting.text,
      updated_at: setting.updatedAt.toISOString(),
    })
  );
});

router.patch("/settings/special-offer", async (req, res): Promise<void> => {
  const parsed = UpdateSpecialOfferBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  await ensureSettings();

  const [setting] = await db
    .update(siteSettingsTable)
    .set({ text: parsed.data.text })
    .returning();

  if (!setting) {
    res.status(500).json({ error: "Failed to update settings" });
    return;
  }

  res.json(
    UpdateSpecialOfferResponse.parse({
      id: setting.id,
      text: setting.text,
      updated_at: setting.updatedAt.toISOString(),
    })
  );
});

export default router;
