import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, isSupabaseConfigured } from "./supabase";

export interface Property {
  id: string;
  title: string;
  price: string;
  status: string;
  location: string | null;
  description: string | null;
  contact_number: string | null;
  images: string[];
  created_at: string;
}

export function getThumb(p: Property): string | null {
  return p.images?.[0] ?? null;
}

export const PROPERTIES_KEY = ["supabase-properties"] as const;
export const FEATURED_KEY = ["supabase-properties-featured"] as const;

async function fetchProperties(statusFilter?: string): Promise<Property[]> {
  if (!supabase) return [];
  let q = supabase.from("properties").select("*").order("created_at", { ascending: false });
  if (statusFilter) q = q.eq("status", statusFilter);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((r: Record<string, unknown>) => ({
    ...r,
    images: Array.isArray(r.images) ? r.images : [],
  })) as Property[];
}

export function useProperties(statusFilter?: string) {
  return useQuery<Property[]>({
    queryKey: statusFilter ? [...PROPERTIES_KEY, statusFilter] : PROPERTIES_KEY,
    queryFn: () => fetchProperties(statusFilter),
    enabled: isSupabaseConfigured,
  });
}

export function useFeaturedProperties() {
  return useQuery<Property[]>({
    queryKey: FEATURED_KEY,
    queryFn: () => fetchProperties("Available"),
    enabled: isSupabaseConfigured,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Property, "id" | "created_at">) => {
      if (!supabase) throw new Error("Supabase not configured");
      const { data: result, error } = await supabase
        .from("properties")
        .insert({ ...data, images: data.images ?? [] })
        .select()
        .single();
      if (error) throw error;
      return result as Property;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROPERTIES_KEY });
      qc.invalidateQueries({ queryKey: FEATURED_KEY });
    },
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Omit<Property, "id" | "created_at">> }) => {
      if (!supabase) throw new Error("Supabase not configured");
      const { data: result, error } = await supabase
        .from("properties")
        .update(data)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return result as Property;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROPERTIES_KEY });
      qc.invalidateQueries({ queryKey: FEATURED_KEY });
    },
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Supabase not configured");
      const { error } = await supabase.from("properties").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PROPERTIES_KEY });
      qc.invalidateQueries({ queryKey: FEATURED_KEY });
    },
  });
}

export async function uploadPropertyImage(file: File): Promise<string> {
  if (!supabase) throw new Error("Supabase not configured");
  const ext = file.name.split(".").pop();
  const path = `properties/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("property-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("property-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadPropertyImages(files: File[]): Promise<string[]> {
  return Promise.all(files.map(uploadPropertyImage));
}
