import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LogOut, Edit2, Trash2, Plus, Save, X, CheckCircle, ToggleLeft, ToggleRight, Home, TrendingUp, XCircle, Star
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListProperties,
  useUpdateProperty,
  useDeleteProperty,
  useCreateProperty,
  useGetSpecialOffer,
  useUpdateSpecialOffer,
  useGetPropertyStats,
  getListPropertiesQueryKey,
  getGetFeaturedPropertiesQueryKey,
  getGetPropertyStatsQueryKey,
  getGetSpecialOfferQueryKey,
} from "@workspace/api-client-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface EditingProperty {
  id: number;
  name: string;
  price: string;
  is_sold_out: boolean;
  image_url: string;
  location: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  description: string;
  property_type: string;
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number | undefined; icon: React.ElementType }) {
  return (
    <div className="bg-[#0a0a0a] border border-white/10 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-white/40 text-xs tracking-widest uppercase mb-1">{label}</p>
          <p className="text-[#D4AF37] font-serif text-3xl">{value ?? "—"}</p>
        </div>
        <Icon size={20} className="text-[#D4AF37]/40 mt-1" />
      </div>
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [userChecked, setUserChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<EditingProperty>>({});
  const [offerText, setOfferText] = useState("");
  const [offerSaved, setOfferSaved] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newProp, setNewProp] = useState({
    name: "", location: "", price: "", bedrooms: 2, bathrooms: 2,
    area_sqft: 1200, description: "", image_url: "", is_sold_out: false,
    is_featured: false, property_type: "Apartment",
  });

  const queryClient = useQueryClient();
  const { data: properties, isLoading } = useListProperties();
  const { data: stats } = useGetPropertyStats();
  const { data: offerData } = useGetSpecialOffer();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const createProperty = useCreateProperty();
  const updateOffer = useUpdateSpecialOffer();

  useEffect(() => {
    if (offerData?.text && !offerText) {
      setOfferText(offerData.text);
    }
  }, [offerData]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthed(true);
      setUserChecked(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setAuthed(true);
      } else {
        setLocation("/login");
      }
      setUserChecked(true);
    });
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    setLocation("/login");
  }

  function startEdit(p: NonNullable<typeof properties>[number]) {
    setEditingId(p.id);
    setEditForm({
      id: p.id,
      name: p.name,
      price: p.price,
      is_sold_out: p.is_sold_out,
      image_url: p.image_url ?? "",
      location: p.location,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      area_sqft: p.area_sqft,
      description: p.description,
      property_type: p.property_type,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({});
  }

  async function saveEdit() {
    if (!editingId) return;
    await updateProperty.mutateAsync({
      id: editingId,
      data: {
        name: editForm.name,
        price: editForm.price,
        is_sold_out: editForm.is_sold_out,
        image_url: editForm.image_url || null,
        location: editForm.location,
        bedrooms: editForm.bedrooms,
        bathrooms: editForm.bathrooms,
        area_sqft: editForm.area_sqft,
        description: editForm.description,
        property_type: editForm.property_type,
      },
    });
    queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFeaturedPropertiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetPropertyStatsQueryKey() });
    setEditingId(null);
    setEditForm({});
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this property permanently?")) return;
    await deleteProperty.mutateAsync({ id });
    queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFeaturedPropertiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetPropertyStatsQueryKey() });
  }

  async function handleToggleSoldOut(id: number, current: boolean) {
    await updateProperty.mutateAsync({ id, data: { is_sold_out: !current } });
    queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFeaturedPropertiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetPropertyStatsQueryKey() });
  }

  async function handleSaveOffer() {
    await updateOffer.mutateAsync({ data: { text: offerText } });
    queryClient.invalidateQueries({ queryKey: getGetSpecialOfferQueryKey() });
    setOfferSaved(true);
    setTimeout(() => setOfferSaved(false), 2500);
  }

  async function handleCreate() {
    await createProperty.mutateAsync({ data: newProp });
    queryClient.invalidateQueries({ queryKey: getListPropertiesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetPropertyStatsQueryKey() });
    setShowCreate(false);
    setNewProp({
      name: "", location: "", price: "", bedrooms: 2, bathrooms: 2,
      area_sqft: 1200, description: "", image_url: "", is_sold_out: false,
      is_featured: false, property_type: "Apartment",
    });
  }

  if (!userChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Admin Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[#D4AF37]/20 h-14 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <span className="font-serif text-[#D4AF37] text-lg">Elite Estates</span>
          <span className="text-white/20 text-xs tracking-widest uppercase">Admin</span>
        </div>
        <div className="flex items-center gap-4">
          {!isSupabaseConfigured && (
            <span className="text-yellow-400 text-xs border border-yellow-400/30 px-2 py-1">
              Supabase not configured — demo mode
            </span>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-white/40 hover:text-white text-xs tracking-widest uppercase transition-colors"
            data-testid="btn-logout"
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      <div className="pt-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total" value={stats?.total} icon={Home} />
            <StatCard label="Available" value={stats?.available} icon={TrendingUp} />
            <StatCard label="Sold Out" value={stats?.sold_out} icon={XCircle} />
            <StatCard label="Featured" value={stats?.featured} icon={Star} />
          </div>

          {/* Special Offer Banner */}
          <div className="mb-10 bg-[#0a0a0a] border border-white/10 p-6">
            <h2 className="font-serif text-lg text-white mb-1">Homepage Marquee Banner</h2>
            <p className="text-white/30 text-xs mb-4">This text scrolls across the top of the homepage.</p>
            <div className="flex gap-3">
              <input
                value={offerText}
                onChange={(e) => setOfferText(e.target.value)}
                className="flex-1 bg-black border border-white/20 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                placeholder="Enter special offer text..."
                data-testid="input-special-offer"
              />
              <button
                onClick={handleSaveOffer}
                disabled={updateOffer.isPending}
                className="flex items-center gap-2 bg-[#D4AF37] text-black font-bold text-xs tracking-widest uppercase px-5 py-3 hover:bg-[#e8c94a] transition-colors disabled:opacity-50"
                data-testid="btn-save-offer"
              >
                {offerSaved ? <CheckCircle size={14} /> : <Save size={14} />}
                {offerSaved ? "Saved" : "Save"}
              </button>
            </div>
          </div>

          {/* Properties */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif text-2xl text-white">Properties</h2>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-[#D4AF37] hover:text-black transition-all"
              data-testid="btn-add-property"
            >
              <Plus size={14} />
              Add Property
            </button>
          </div>

          {/* Create Form */}
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-[#0d0d0d] border border-[#D4AF37]/30 p-6"
            >
              <h3 className="font-serif text-lg text-[#D4AF37] mb-4">New Property</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "name", label: "Name", type: "text" },
                  { key: "location", label: "Location", type: "text" },
                  { key: "price", label: "Price (e.g. ₹2.5 Cr)", type: "text" },
                  { key: "property_type", label: "Type", type: "text" },
                  { key: "bedrooms", label: "Bedrooms", type: "number" },
                  { key: "bathrooms", label: "Bathrooms", type: "number" },
                  { key: "area_sqft", label: "Area (sqft)", type: "number" },
                  { key: "image_url", label: "Image URL", type: "text" },
                ].map(({ key, label, type }) => (
                  <div key={key}>
                    <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">{label}</label>
                    <input
                      type={type}
                      value={String((newProp as Record<string, unknown>)[key] ?? "")}
                      onChange={(e) =>
                        setNewProp((p) => ({
                          ...p,
                          [key]: type === "number" ? parseInt(e.target.value) || 0 : e.target.value,
                        }))
                      }
                      className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                      data-testid={`input-new-${key}`}
                    />
                  </div>
                ))}
                <div className="sm:col-span-2">
                  <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">Description</label>
                  <textarea
                    value={newProp.description}
                    onChange={(e) => setNewProp((p) => ({ ...p, description: e.target.value }))}
                    rows={3}
                    className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                    data-testid="input-new-description"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleCreate}
                  disabled={createProperty.isPending}
                  className="bg-[#D4AF37] text-black font-bold text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-[#e8c94a] disabled:opacity-50"
                  data-testid="btn-create-property"
                >
                  Create Property
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="text-white/40 text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}

          {/* Property List */}
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {properties?.map((p) => (
                <motion.div
                  key={p.id}
                  layout
                  className="bg-[#0a0a0a] border border-white/10 p-4"
                  data-testid={`admin-property-${p.id}`}
                >
                  {editingId === p.id ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { key: "name", label: "Name", type: "text" },
                        { key: "price", label: "Price", type: "text" },
                        { key: "location", label: "Location", type: "text" },
                        { key: "property_type", label: "Type", type: "text" },
                        { key: "bedrooms", label: "Beds", type: "number" },
                        { key: "bathrooms", label: "Baths", type: "number" },
                        { key: "area_sqft", label: "Area sqft", type: "number" },
                        { key: "image_url", label: "Image URL", type: "text" },
                      ].map(({ key, label, type }) => (
                        <div key={key}>
                          <label className="text-white/30 text-xs mb-1 block">{label}</label>
                          <input
                            type={type}
                            value={String((editForm as Record<string, unknown>)[key] ?? "")}
                            onChange={(e) =>
                              setEditForm((f) => ({
                                ...f,
                                [key]: type === "number" ? parseInt(e.target.value) || 0 : e.target.value,
                              }))
                            }
                            className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                            data-testid={`input-edit-${key}`}
                          />
                        </div>
                      ))}
                      <div className="sm:col-span-2">
                        <label className="text-white/30 text-xs mb-1 block">Description</label>
                        <textarea
                          value={editForm.description ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                          rows={2}
                          className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div className="sm:col-span-2 flex items-center gap-3">
                        <label className="text-white/40 text-xs uppercase tracking-widest">Sold Out</label>
                        <button
                          onClick={() => setEditForm((f) => ({ ...f, is_sold_out: !f.is_sold_out }))}
                          className="text-[#D4AF37]"
                        >
                          {editForm.is_sold_out ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        </button>
                      </div>
                      <div className="sm:col-span-2 flex gap-3 mt-2">
                        <button
                          onClick={saveEdit}
                          disabled={updateProperty.isPending}
                          className="flex items-center gap-2 bg-[#D4AF37] text-black font-bold text-xs tracking-widest uppercase px-5 py-2 hover:bg-[#e8c94a] disabled:opacity-50"
                          data-testid="btn-save-edit"
                        >
                          <Save size={13} /> Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="flex items-center gap-2 text-white/40 text-xs tracking-widest uppercase px-4 py-2 border border-white/10 hover:border-white/30"
                          data-testid="btn-cancel-edit"
                        >
                          <X size={13} /> Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        {p.image_url && (
                          <img
                            src={p.image_url}
                            alt={p.name}
                            className="w-14 h-14 object-cover flex-shrink-0"
                            loading="lazy"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-serif text-white text-base truncate">{p.name}</p>
                          <p className="text-white/40 text-xs">{p.location} — {p.property_type}</p>
                          <p className="text-[#D4AF37] text-sm font-bold">{p.price}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleToggleSoldOut(p.id, p.is_sold_out)}
                          className={`text-xs tracking-widest uppercase px-3 py-1.5 border transition-all min-h-[36px] ${
                            p.is_sold_out
                              ? "border-red-500/50 text-red-400 hover:border-red-500"
                              : "border-green-500/50 text-green-400 hover:border-green-500"
                          }`}
                          data-testid={`btn-toggle-sold-${p.id}`}
                        >
                          {p.is_sold_out ? "Sold Out" : "Available"}
                        </button>
                        <button
                          onClick={() => startEdit(p)}
                          className="p-2 text-white/40 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/40 transition-all"
                          data-testid={`btn-edit-${p.id}`}
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-2 text-white/40 hover:text-red-400 border border-white/10 hover:border-red-400/40 transition-all"
                          data-testid={`btn-delete-${p.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
