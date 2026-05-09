// @ts-nocheck
import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, propertiesTable } from "@workspace/db";
import {
  ListPropertiesQueryParams,
  CreatePropertyBody,
  GetPropertyParams,
  UpdatePropertyParams,
  UpdatePropertyBody,
  DeletePropertyParams,
  ListPropertiesResponse,
  GetFeaturedPropertiesResponse,
  GetPropertyStatsResponse,
  GetPropertyResponse,
  UpdatePropertyResponse,
} from "@workspace/api-zod";

const router = Router();

// Helper to map DB fields to API fields
const mapProperty = (p: any) => ({
  ...p,
  area_sqft: p.areaSqft,
  is_sold_out: p.isSoldOut,
  is_featured: p.isFeatured,
  property_type: p.propertyType,
  image_url: p.imageUrl,
  created_at: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
  updated_at: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
});

router.get("/", async (req: any, res: any) => {
  const query = ListPropertiesQueryParams.safeParse(req.query);
  if (!query.success) {
    return res.status(400).json({ error: query.error.message });
  }

  let conditions = undefined;
  if (query.data.sold_out !== null && query.data.sold_out !== undefined) {
    conditions = eq(propertiesTable.isSoldOut, query.data.sold_out);
  }

  const properties = await db
    .select()
    .from(propertiesTable)
    .where(conditions)
    .orderBy(propertiesTable.createdAt);

  res.json(ListPropertiesResponse.parse(properties.map(mapProperty)));
});

router.get("/featured", async (_req: any, res: any) => {
  const properties = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.isSoldOut, false))
    .orderBy(propertiesTable.createdAt);

  res.json(GetFeaturedPropertiesResponse.parse(properties.map(mapProperty)));
});

router.get("/stats", async (_req: any, res: any) => {
  const all = await db.select().from(propertiesTable);
  const stats = {
    total: all.length,
    available: all.filter((p: any) => !p.isSoldOut).length,
    sold_out: all.filter((p: any) => p.isSoldOut).length,
    featured: all.filter((p: any) => p.isFeatured).length,
  };
  res.json(GetPropertyStatsResponse.parse(stats));
});

router.post("/", async (req: any, res: any) => {
  const parsed = CreatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }

  const data = parsed.data;
  const [property] = await db
    .insert(propertiesTable)
    .values({
      name: data.name,
      location: data.location,
      price: data.price,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      areaSqft: data.area_sqft,
      description: data.description,
      imageUrl: data.image_url ?? null,
      isSoldOut: data.is_sold_out ?? false,
      isFeatured: data.is_featured ?? false,
      propertyType: data.property_type,
    })
    .returning();

  res.status(201).json(GetPropertyResponse.parse(mapProperty(property)));
});

router.get("/:id", async (req: any, res: any) => {
  const raw = req.params.id;
  const params = GetPropertyParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    return res.status(400).json({ error: params.error.message });
  }

  const [property] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, params.data.id));

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  res.json(GetPropertyResponse.parse(mapProperty(property)));
});

router.patch("/:id", async (req: any, res: any) => {
  const raw = req.params.id;
  const params = UpdatePropertyParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    return res.status(400).json({ error: params.error.message });
  }

  const parsed = UpdatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.message });
  }

  const data = parsed.data;
  const updates: any = {};
  if (data.name != null) updates.name = data.name;
  if (data.location != null) updates.location = data.location;
  if (data.price != null) updates.price = data.price;
  if (data.bedrooms != null) updates.bedrooms = data.bedrooms;
  if (data.bathrooms != null) updates.bathrooms = data.bathrooms;
  if (data.area_sqft != null) updates.areaSqft = data.area_sqft;
  if (data.description != null) updates.description = data.description;
  if (data.image_url !== undefined) updates.imageUrl = data.image_url;
  if (data.is_sold_out != null) updates.isSoldOut = data.is_sold_out;
  if (data.is_featured != null) updates.isFeatured = data.is_featured;
  if (data.property_type != null) updates.propertyType = data.property_type;

  const [property] = await db
    .update(propertiesTable)
    .set(updates)
    .where(eq(propertiesTable.id, params.data.id))
    .returning();

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  res.json(UpdatePropertyResponse.parse(mapProperty(property)));
});

router.delete("/:id", async (req: any, res: any) => {
  const raw = req.params.id;
  const params = DeletePropertyParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    return res.status(400).json({ error: params.error.message });
  }

  const [property] = await db
    .delete(propertiesTable)
    .where(eq(propertiesTable.id, params.data.id))
    .returning();

  if (!property) {
    return res.status(404).json({ error: "Property not found" });
  }

  res.sendStatus(204);
});

export default router;
