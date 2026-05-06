import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
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

const router: IRouter = Router();

router.get("/properties", async (req, res): Promise<void> => {
  const query = ListPropertiesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
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

  const mapped = properties.map((p) => ({
    ...p,
    area_sqft: p.areaSqft,
    is_sold_out: p.isSoldOut,
    is_featured: p.isFeatured,
    property_type: p.propertyType,
    image_url: p.imageUrl,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  }));

  res.json(ListPropertiesResponse.parse(mapped));
});

router.get("/properties/featured", async (_req, res): Promise<void> => {
  const properties = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.isSoldOut, false))
    .orderBy(propertiesTable.createdAt);

  const mapped = properties.map((p) => ({
    ...p,
    area_sqft: p.areaSqft,
    is_sold_out: p.isSoldOut,
    is_featured: p.isFeatured,
    property_type: p.propertyType,
    image_url: p.imageUrl,
    created_at: p.createdAt.toISOString(),
    updated_at: p.updatedAt.toISOString(),
  }));

  res.json(GetFeaturedPropertiesResponse.parse(mapped));
});

router.get("/properties/stats", async (_req, res): Promise<void> => {
  const all = await db.select().from(propertiesTable);
  const stats = {
    total: all.length,
    available: all.filter((p) => !p.isSoldOut).length,
    sold_out: all.filter((p) => p.isSoldOut).length,
    featured: all.filter((p) => p.isFeatured).length,
  };
  res.json(GetPropertyStatsResponse.parse(stats));
});

router.post("/properties", async (req, res): Promise<void> => {
  const parsed = CreatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
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

  const mapped = {
    ...property,
    area_sqft: property.areaSqft,
    is_sold_out: property.isSoldOut,
    is_featured: property.isFeatured,
    property_type: property.propertyType,
    image_url: property.imageUrl,
    created_at: property.createdAt.toISOString(),
    updated_at: property.updatedAt.toISOString(),
  };

  res.status(201).json(GetPropertyResponse.parse(mapped));
});

router.get("/properties/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetPropertyParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [property] = await db
    .select()
    .from(propertiesTable)
    .where(eq(propertiesTable.id, params.data.id));

  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const mapped = {
    ...property,
    area_sqft: property.areaSqft,
    is_sold_out: property.isSoldOut,
    is_featured: property.isFeatured,
    property_type: property.propertyType,
    image_url: property.imageUrl,
    created_at: property.createdAt.toISOString(),
    updated_at: property.updatedAt.toISOString(),
  };

  res.json(GetPropertyResponse.parse(mapped));
});

router.patch("/properties/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdatePropertyParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdatePropertyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const data = parsed.data;
  const updates: Record<string, unknown> = {};
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
    res.status(404).json({ error: "Property not found" });
    return;
  }

  const mapped = {
    ...property,
    area_sqft: property.areaSqft,
    is_sold_out: property.isSoldOut,
    is_featured: property.isFeatured,
    property_type: property.propertyType,
    image_url: property.imageUrl,
    created_at: property.createdAt.toISOString(),
    updated_at: property.updatedAt.toISOString(),
  };

  res.json(UpdatePropertyResponse.parse(mapped));
});

router.delete("/properties/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeletePropertyParams.safeParse({ id: parseInt(raw, 10) });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [property] = await db
    .delete(propertiesTable)
    .where(eq(propertiesTable.id, params.data.id))
    .returning();

  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
