import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LogOut, Edit2, Trash2, Plus, Save, X, CheckCircle,
  Home, TrendingUp, XCircle, Star, Upload, ImageIcon,
  Sparkles, AlignLeft,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetSpecialOffer,
  useUpdateSpecialOffer,
  getGetSpecialOfferQueryKey,
} from "@workspace/api-client-react";
import {
  useProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
  uploadPropertyImage,
  PROPERTIES_KEY,
  FEATURED_KEY,
  type Property,
} from "@/lib/properties";
import {
  useAmenities,
  usePropertyAmenities,
  useCreateAmenity,
  useDeleteAmenity,
  useSetPropertyAmenities,
  type Amenity,
} from "@/lib/amenities";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

type Tab = "properties" | "amenities" | "banner";

const EMPTY_PROPERTY = {
  title: "",
  price: "",
  status: "Available",
  location: "",
  description: "",
  contact_number: "",
  images: [] as string[],
  amenityIds: [] as string[],
};

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

function MultiImageUploader({
  images,
  onChange,
  max = 15,
}: {
  images: string[];
  onChange: (urls: string[]) => void;
  max?: number;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = max - images.length;
    const toUpload = files.slice(0, remaining);
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all(toUpload.map((f) => uploadPropertyImage(f)));
      onChange([...images, ...urls]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeImage(idx: number) {
    onChange(images.filter((_, i) => i !== idx));
  }

  return (
    <div>
      <label className="text-white/40 text-xs tracking-widest uppercase block mb-2">
        Photos ({images.length}/{max})
      </label>

      {images.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {images.map((url, idx) => (
            <div key={idx} className="relative group">
              <img
                src={url}
                alt={`Photo ${idx + 1}`}
                className="w-16 h-16 object-cover border border-white/20"
              />
              {idx === 0 && (
                <span className="absolute bottom-0 left-0 right-0 bg-[#D4AF37] text-black text-[8px] text-center font-bold">
                  COVER
                </span>
              )}
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < max && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading || !isSupabaseConfigured}
          className="flex items-center gap-2 border border-white/20 text-white/60 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] text-xs tracking-widest uppercase px-4 py-2.5 transition-all disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-3 h-3 border border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={13} />
              Upload Photos
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function AmenitiesChecklist({
  allAmenities,
  selected,
  onChange,
}: {
  allAmenities: Amenity[];
  selected: string[];
  onChange: (ids: string[]) => void;
}) {
  function toggle(id: string) {
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  }

  if (allAmenities.length === 0) {
    return (
      <p className="text-white/30 text-xs">No amenities yet. Add them in the Amenities tab first.</p>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {allAmenities.map((a) => {
        const isSelected = selected.includes(a.id);
        return (
          <button
            key={a.id}
            type="button"
            onClick={() => toggle(a.id)}
            className={`flex items-center gap-1.5 text-xs tracking-wide px-3 py-1.5 border transition-all ${
              isSelected
                ? "border-[#D4AF37] bg-[#D4AF37]/10 text-[#D4AF37]"
                : "border-white/20 text-white/50 hover:border-white/40"
            }`}
          >
            <span>{a.icon}</span>
            {a.name}
          </button>
        );
      })}
    </div>
  );
}

function PropertyEditForm({
  property,
  allAmenities,
  onSave,
  onCancel,
  isPending,
}: {
  property: Property;
  allAmenities: Amenity[];
  onSave: (data: Partial<Property>, amenityIds: string[]) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const { data: propAmenities } = usePropertyAmenities(property.id);
  const [form, setForm] = useState<Partial<Property>>({ ...property });
  const [images, setImages] = useState<string[]>(property.images ?? []);
  const [amenityIds, setAmenityIds] = useState<string[]>([]);

  useEffect(() => {
    if (propAmenities) {
      setAmenityIds(propAmenities.map((a) => a.id));
    }
  }, [propAmenities]);

  const f = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [key]: e.target.value }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-white/30 text-xs mb-1 block">Title</label>
        <input value={form.title ?? ""} onChange={f("title")} className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]" />
      </div>
      <div>
        <label className="text-white/30 text-xs mb-1 block">Price</label>
        <input value={form.price ?? ""} onChange={f("price")} className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]" />
      </div>
      <div>
        <label className="text-white/30 text-xs mb-1 block">Location</label>
        <input value={form.location ?? ""} onChange={f("location")} placeholder="e.g. Koregaon Park, Pune" className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]" />
      </div>
      <div>
        <label className="text-white/30 text-xs mb-1 block">Contact Number</label>
        <input value={form.contact_number ?? ""} onChange={f("contact_number")} placeholder="e.g. +91 99999 99999" className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]" />
      </div>
      <div>
        <label className="text-white/30 text-xs mb-1 block">Status</label>
        <select value={form.status ?? "Available"} onChange={f("status")} className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]">
          <option value="Available">Available</option>
          <option value="Sold Out">Sold Out</option>
        </select>
      </div>
      <div className="sm:col-span-2">
        <label className="text-white/30 text-xs mb-1 block">Description</label>
        <textarea value={form.description ?? ""} onChange={f("description")} rows={3} placeholder="Detailed description of the property..." className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] resize-none" />
      </div>
      <div className="sm:col-span-2">
        <MultiImageUploader images={images} onChange={setImages} />
      </div>
      <div className="sm:col-span-2">
        <label className="text-white/30 text-xs mb-2 block">Amenities</label>
        <AmenitiesChecklist allAmenities={allAmenities} selected={amenityIds} onChange={setAmenityIds} />
      </div>
      <div className="sm:col-span-2 flex gap-3">
        <button
          onClick={() => onSave({ ...form, images }, amenityIds)}
          disabled={isPending}
          className="flex items-center gap-2 bg-[#D4AF37] text-black font-bold text-xs tracking-widest uppercase px-5 py-2 hover:bg-[#e8c94a] disabled:opacity-50"
        >
          <Save size={13} /> Save Changes
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-white/40 text-xs tracking-widest uppercase px-4 py-2 border border-white/10 hover:border-white/30"
        >
          <X size={13} /> Cancel
        </button>
      </div>
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [userChecked, setUserChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("properties");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [offerText, setOfferText] = useState("");
  const [offerSaved, setOfferSaved] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newProp, setNewProp] = useState({ ...EMPTY_PROPERTY });
  const [newAmenity, setNewAmenity] = useState({ name: "", icon: "✦" });
  const [showNewAmenity, setShowNewAmenity] = useState(false);

  const qc = useQueryClient();
  const { data: properties, isLoading } = useProperties();
  const { data: offerData } = useGetSpecialOffer();
  const { data: allAmenities = [] } = useAmenities();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const updateOffer = useUpdateSpecialOffer();
  const createAmenity = useCreateAmenity();
  const deleteAmenity = useDeleteAmenity();
  const setPropertyAmenities = useSetPropertyAmenities();

  const total = properties?.length ?? 0;
  const available = properties?.filter((p) => p.status === "Available").length ?? 0;
  const soldOut = properties?.filter((p) => p.status !== "Available").length ?? 0;
  const featured = available;

  useEffect(() => {
    if (offerData?.text && !offerText) setOfferText(offerData.text);
  }, [offerData]);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setAuthed(true);
      setUserChecked(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setAuthed(true);
      else setLocation("/login");
      setUserChecked(true);
    });
  }, []);

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    setLocation("/login");
  }

  async function handleSaveOffer() {
    await updateOffer.mutateAsync({ data: { text: offerText } });
    qc.invalidateQueries({ queryKey: getGetSpecialOfferQueryKey() });
    setOfferSaved(true);
    setTimeout(() => setOfferSaved(false), 2500);
  }

  async function handleCreate() {
    const created = await createProperty.mutateAsync({
      title: newProp.title,
      price: newProp.price,
      status: newProp.status,
      location: newProp.location || null,
      description: newProp.description || null,
      contact_number: newProp.contact_number || null,
      images: newProp.images,
    });
    if (newProp.amenityIds.length > 0) {
      await setPropertyAmenities.mutateAsync({ propertyId: created.id, amenityIds: newProp.amenityIds });
    }
    setShowCreate(false);
    setNewProp({ ...EMPTY_PROPERTY });
  }

  async function handleSaveEdit(id: string, data: Partial<Property>, amenityIds: string[]) {
    await updateProperty.mutateAsync({ id, data });
    await setPropertyAmenities.mutateAsync({ propertyId: id, amenityIds });
    setEditingId(null);
    qc.invalidateQueries({ queryKey: PROPERTIES_KEY });
    qc.invalidateQueries({ queryKey: FEATURED_KEY });
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this property permanently?")) return;
    await deleteProperty.mutateAsync(id);
  }

  async function handleToggleStatus(p: Property) {
    const next = p.status === "Available" ? "Sold Out" : "Available";
    await updateProperty.mutateAsync({ id: p.id, data: { status: next } });
  }

  async function handleCreateAmenity() {
    if (!newAmenity.name.trim()) return;
    await createAmenity.mutateAsync({ name: newAmenity.name.trim(), icon: newAmenity.icon.trim() || "✦" });
    setNewAmenity({ name: "", icon: "✦" });
    setShowNewAmenity(false);
  }

  if (!userChecked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  if (!authed) return null;

  const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
    { key: "properties", label: "Properties", icon: Home },
    { key: "amenities", label: "Amenities", icon: Sparkles },
    { key: "banner", label: "Banner", icon: AlignLeft },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Top Bar */}
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
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </div>

      <div className="pt-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            <StatCard label="Total" value={total} icon={Home} />
            <StatCard label="Available" value={available} icon={TrendingUp} />
            <StatCard label="Sold Out" value={soldOut} icon={XCircle} />
            <StatCard label="Featured" value={featured} icon={Star} />
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/10 mb-8">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex items-center gap-2 px-6 py-3 text-xs tracking-widest uppercase transition-all border-b-2 -mb-px ${
                  activeTab === t.key
                    ? "border-[#D4AF37] text-[#D4AF37]"
                    : "border-transparent text-white/40 hover:text-white/70"
                }`}
              >
                <t.icon size={13} />
                {t.label}
              </button>
            ))}
          </div>

          {/* ── PROPERTIES TAB ── */}
          {activeTab === "properties" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-2xl text-white">Properties</h2>
                <button
                  onClick={() => setShowCreate(!showCreate)}
                  className="flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-[#D4AF37] hover:text-black transition-all"
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
                  <h3 className="font-serif text-lg text-[#D4AF37] mb-5">New Property</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {[
                      { key: "title", label: "Title", placeholder: "e.g. The Crown Residences" },
                      { key: "price", label: "Price", placeholder: "e.g. ₹4.2 Cr" },
                      { key: "location", label: "Location", placeholder: "e.g. Koregaon Park, Pune" },
                      { key: "contact_number", label: "Contact Number", placeholder: "e.g. +91 99999 99999" },
                    ].map(({ key, label, placeholder }) => (
                      <div key={key}>
                        <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">{label}</label>
                        <input
                          type="text"
                          value={(newProp as Record<string, unknown>)[key] as string}
                          onChange={(e) => setNewProp((p) => ({ ...p, [key]: e.target.value }))}
                          className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                          placeholder={placeholder}
                        />
                      </div>
                    ))}
                    <div>
                      <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">Status</label>
                      <select
                        value={newProp.status}
                        onChange={(e) => setNewProp((p) => ({ ...p, status: e.target.value }))}
                        className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                      >
                        <option value="Available">Available</option>
                        <option value="Sold Out">Sold Out</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">Description</label>
                      <textarea
                        value={newProp.description}
                        onChange={(e) => setNewProp((p) => ({ ...p, description: e.target.value }))}
                        rows={3}
                        placeholder="Detailed description of the property..."
                        className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37] resize-none"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <MultiImageUploader
                        images={newProp.images}
                        onChange={(imgs) => setNewProp((p) => ({ ...p, images: imgs }))}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-white/40 text-xs tracking-widest uppercase block mb-2">Amenities</label>
                      <AmenitiesChecklist
                        allAmenities={allAmenities}
                        selected={newProp.amenityIds}
                        onChange={(ids) => setNewProp((p) => ({ ...p, amenityIds: ids }))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={handleCreate}
                      disabled={createProperty.isPending || !newProp.title || !newProp.price}
                      className="bg-[#D4AF37] text-black font-bold text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-[#e8c94a] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {createProperty.isPending ? "Creating..." : "Create Property"}
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
              ) : !isSupabaseConfigured ? (
                <div className="border border-white/10 p-8 text-center">
                  <p className="text-white/30 font-serif">Connect Supabase to manage properties.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {properties?.map((p) => (
                    <motion.div
                      key={p.id}
                      layout
                      className="bg-[#0a0a0a] border border-white/10 p-4"
                    >
                      {editingId === p.id ? (
                        <PropertyEditForm
                          property={p}
                          allAmenities={allAmenities}
                          onSave={(data, amenityIds) => handleSaveEdit(p.id, data, amenityIds)}
                          onCancel={() => setEditingId(null)}
                          isPending={updateProperty.isPending || setPropertyAmenities.isPending}
                        />
                      ) : (
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            {p.images?.[0] ? (
                              <img
                                src={p.images[0]}
                                alt={p.title}
                                className="w-14 h-14 object-cover flex-shrink-0 border border-white/10"
                                loading="lazy"
                              />
                            ) : (
                              <div className="w-14 h-14 bg-white/5 flex items-center justify-center flex-shrink-0">
                                <ImageIcon size={18} className="text-white/20" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-serif text-white text-base truncate">{p.title}</p>
                              <p className="text-[#D4AF37] text-sm font-bold">{p.price}</p>
                              {p.location && (
                                <p className="text-white/30 text-xs truncate">{p.location}</p>
                              )}
                              {p.images && p.images.length > 0 && (
                                <p className="text-white/20 text-xs">{p.images.length} photo{p.images.length > 1 ? "s" : ""}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleToggleStatus(p)}
                              disabled={updateProperty.isPending}
                              className={`text-xs tracking-widest uppercase px-3 py-1.5 border transition-all min-h-[36px] disabled:opacity-50 ${
                                p.status === "Available"
                                  ? "border-green-500/50 text-green-400 hover:border-green-500"
                                  : "border-red-500/50 text-red-400 hover:border-red-500"
                              }`}
                            >
                              {p.status}
                            </button>
                            <button
                              onClick={() => setEditingId(p.id)}
                              className="p-2 text-white/40 hover:text-[#D4AF37] border border-white/10 hover:border-[#D4AF37]/40 transition-all"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(p.id)}
                              className="p-2 text-white/40 hover:text-red-400 border border-white/10 hover:border-red-400/40 transition-all"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {properties?.length === 0 && (
                    <div className="border border-white/10 p-10 text-center">
                      <p className="text-white/30 font-serif mb-2">No properties yet.</p>
                      <p className="text-white/20 text-xs">Click "Add Property" to create your first listing.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── AMENITIES TAB ── */}
          {activeTab === "amenities" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-serif text-2xl text-white">Amenities</h2>
                  <p className="text-white/30 text-xs mt-1">
                    Global amenities shown on the homepage and linked to properties.
                  </p>
                </div>
                <button
                  onClick={() => setShowNewAmenity(!showNewAmenity)}
                  className="flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] text-xs tracking-widest uppercase px-5 py-2.5 hover:bg-[#D4AF37] hover:text-black transition-all"
                >
                  <Plus size={14} />
                  Add Amenity
                </button>
              </div>

              {showNewAmenity && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 bg-[#0d0d0d] border border-[#D4AF37]/30 p-6"
                >
                  <h3 className="font-serif text-lg text-[#D4AF37] mb-4">New Amenity</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={newAmenity.name}
                        onChange={(e) => setNewAmenity((a) => ({ ...a, name: e.target.value }))}
                        placeholder="e.g. Swimming Pool"
                        className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div>
                      <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">
                        Icon (emoji)
                      </label>
                      <input
                        type="text"
                        value={newAmenity.icon}
                        onChange={(e) => setNewAmenity((a) => ({ ...a, icon: e.target.value }))}
                        placeholder="e.g. 🏊"
                        className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                      />
                      <p className="text-white/20 text-xs mt-1">
                        Paste any emoji: 🏋️ 🅿️ 🌳 🏊 🛡️ 🛎️ 🎾 🧖
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCreateAmenity}
                      disabled={createAmenity.isPending || !newAmenity.name.trim()}
                      className="bg-[#D4AF37] text-black font-bold text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-[#e8c94a] disabled:opacity-50"
                    >
                      {createAmenity.isPending ? "Adding..." : "Add Amenity"}
                    </button>
                    <button
                      onClick={() => setShowNewAmenity(false)}
                      className="text-white/40 text-xs tracking-widest uppercase px-4 py-2.5 border border-white/10 hover:border-white/30"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}

              {!isSupabaseConfigured ? (
                <div className="border border-white/10 p-8 text-center">
                  <p className="text-white/30 font-serif">Connect Supabase to manage amenities.</p>
                </div>
              ) : allAmenities.length === 0 ? (
                <div className="border border-white/10 p-10 text-center">
                  <p className="text-white/30 font-serif mb-2">No amenities yet.</p>
                  <p className="text-white/20 text-xs">Add amenities like Gym, Pool, Parking to display on the homepage.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                  {allAmenities.map((a) => (
                    <motion.div
                      key={a.id}
                      layout
                      className="flex items-center justify-between gap-3 bg-[#0a0a0a] border border-white/10 px-4 py-3 group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl flex-shrink-0">{a.icon}</span>
                        <span className="text-white/70 text-sm truncate">{a.name}</span>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${a.name}"?`)) deleteAmenity.mutate(a.id);
                        }}
                        className="text-white/20 hover:text-red-400 flex-shrink-0 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── BANNER TAB ── */}
          {activeTab === "banner" && (
            <div>
              <h2 className="font-serif text-2xl text-white mb-6">Homepage Marquee Banner</h2>
              <div className="bg-[#0a0a0a] border border-white/10 p-6">
                <p className="text-white/30 text-xs mb-4">
                  This text scrolls across the top of the homepage below the hero.
                </p>
                <div className="flex gap-3">
                  <input
                    value={offerText}
                    onChange={(e) => setOfferText(e.target.value)}
                    className="flex-1 bg-black border border-white/20 text-white px-4 py-3 text-sm focus:outline-none focus:border-[#D4AF37] transition-colors"
                    placeholder="Enter special offer text..."
                  />
                  <button
                    onClick={handleSaveOffer}
                    disabled={updateOffer.isPending}
                    className="flex items-center gap-2 bg-[#D4AF37] text-black font-bold text-xs tracking-widest uppercase px-5 py-3 hover:bg-[#e8c94a] transition-colors disabled:opacity-50"
                  >
                    {offerSaved ? <CheckCircle size={14} /> : <Save size={14} />}
                    {offerSaved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
