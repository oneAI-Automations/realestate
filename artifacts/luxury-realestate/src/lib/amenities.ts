import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  created_at: string;
}

export const AMENITIES_KEY = ["supabase-amenities"] as const;

export function useAmenities() {
  return useQuery<Amenity[]>({
    queryKey: AMENITIES_KEY,
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from("amenities")
        .select("*")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Amenity[];
    },
    enabled: isSupabaseConfigured,
  });
}

export function usePropertyAmenities(propertyId: string | null) {
  return useQuery<Amenity[]>({
    queryKey: ["property-amenities", propertyId],
    queryFn: async () => {
      if (!supabase || !propertyId) return [];
      const { data, error } = await supabase
        .from("property_amenities")
        .select("amenities(id, name, icon, created_at)")
        .eq("property_id", propertyId);
      if (error) throw error;
      return ((data ?? []).map((r: Record<string, unknown>) => r.amenities).filter(Boolean)) as Amenity[];
    },
    enabled: isSupabaseConfigured && !!propertyId,
  });
}

export function useCreateAmenity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { name: string; icon: string }) => {
      if (!supabase) throw new Error("Supabase not configured");
      const { data: result, error } = await supabase
        .from("amenities")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result as Amenity;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: AMENITIES_KEY }),
  });
}

export function useDeleteAmenity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase.from("amenities").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: AMENITIES_KEY }),
  });
}

export async function setPropertyAmenities(propertyId: string, amenityIds: string[]): Promise<void> {
  if (!supabase) throw new Error("Supabase not configured");
  const { error: delError } = await supabase
    .from("property_amenities")
    .delete()
    .eq("property_id", propertyId);
  if (delError) throw delError;
  if (amenityIds.length === 0) return;
  const rows = amenityIds.map((amenity_id) => ({ property_id: propertyId, amenity_id }));
  const { error: insError } = await supabase.from("property_amenities").insert(rows);
  if (insError) throw insError;
}

export function useSetPropertyAmenities() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, amenityIds }: { propertyId: string; amenityIds: string[] }) =>
      setPropertyAmenities(propertyId, amenityIds),
    onSuccess: (_data, { propertyId }) => {
      qc.invalidateQueries({ queryKey: ["property-amenities", propertyId] });
    },
  });
}
