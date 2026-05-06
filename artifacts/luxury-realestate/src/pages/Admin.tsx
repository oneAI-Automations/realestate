import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import {
  LogOut, Edit2, Trash2, Plus, Save, X, CheckCircle,
  Home, TrendingUp, XCircle, Star, Upload, ImageIcon,
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
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

function StatCard({
  label, value, icon: Icon,
}: { label: string; value: number | undefined; icon: React.ElementType }) {
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

function ImageUploader({
  onUploaded,
  currentUrl,
}: {
  onUploaded: (url: string) => void;
  currentUrl?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadPropertyImage(file);
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="text-white/40 text-xs tracking-widest uppercase block mb-2">
        Property Photo
      </label>
      <div className="flex items-center gap-3 flex-wrap">
        {currentUrl && (
          <img
            src={currentUrl}
            alt="Preview"
            className="w-16 h-16 object-cover border border-white/20"
          />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 border border-white/20 text-white/60 hover:border-[#D4AF37]/50 hover:text-[#D4AF37] text-xs tracking-widest uppercase px-4 py-2.5 transition-all disabled:opacity-50"
          data-testid="btn-upload-image"
        >
          {uploading ? (
            <>
              <div className="w-3 h-3 border border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload size={13} />
              Upload Photo
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />
      </div>
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
      {!isSupabaseConfigured && (
        <p className="text-yellow-400/60 text-xs mt-1">
          Supabase not configured — uploads disabled
        </p>
      )}
    </div>
  );
}

export default function Admin() {
  const [, setLocation] = useLocation();
  const [userChecked, setUserChecked] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Property>>({});
  const [offerText, setOfferText] = useState("");
  const [offerSaved, setOfferSaved] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newProp, setNewProp] = useState({
    title: "",
    price: "",
    status: "Available",
    image_url: "",
  });
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  const qc = useQueryClient();
  const { data: properties, isLoading } = useProperties();
  const { data: offerData } = useGetSpecialOffer();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const deleteProperty = useDeleteProperty();
  const updateOffer = useUpdateSpecialOffer();

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
      if (data.user) {
        setAuthed(true);
      } else {
        setLocation("/login");
      }
      setUserChecked(true);
    });
  }, []);

  async function handleLogout() {
    if (supabase) await supabase.auth.signOut();
    setLocation("/login");
  }

  function startEdit(p: Property) {
    setEditingId(p.id);
    setEditForm({ ...p });
    setImageUrls((prev) => ({ ...prev, [p.id]: p.image_url ?? "" }));
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
        title: editForm.title,
        price: editForm.price,
        status: editForm.status,
        image_url: imageUrls[editingId] || editForm.image_url || null,
      },
    });
    setEditingId(null);
    setEditForm({});
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this property permanently?")) return;
    await deleteProperty.mutateAsync(id);
  }

  async function handleToggleStatus(p: Property) {
    const next = p.status === "Available" ? "Sold Out" : "Available";
    await updateProperty.mutateAsync({ id: p.id, data: { status: next } });
  }

  async function handleSaveOffer() {
    await updateOffer.mutateAsync({ data: { text: offerText } });
    qc.invalidateQueries({ queryKey: getGetSpecialOfferQueryKey() });
    setOfferSaved(true);
    setTimeout(() => setOfferSaved(false), 2500);
  }

  async function handleCreate() {
    await createProperty.mutateAsync({
      title: newProp.title,
      price: newProp.price,
      status: newProp.status,
      image_url: newProp.image_url || null,
    });
    setShowCreate(false);
    setNewProp({ title: "", price: "", status: "Available", image_url: "" });
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
            data-testid="btn-logout"
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

          {/* Special Offer Banner */}
          <div className="mb-10 bg-[#0a0a0a] border border-white/10 p-6">
            <h2 className="font-serif text-lg text-white mb-1">Homepage Marquee Banner</h2>
            <p className="text-white/30 text-xs mb-4">
              This text scrolls across the top of the homepage.
            </p>
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

          {/* Properties Header */}
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
              <h3 className="font-serif text-lg text-[#D4AF37] mb-5">New Property</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">Title</label>
                  <input
                    type="text"
                    value={newProp.title}
                    onChange={(e) => setNewProp((p) => ({ ...p, title: e.target.value }))}
                    className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                    placeholder="e.g. The Crown Residences"
                    data-testid="input-new-title"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">Price</label>
                  <input
                    type="text"
                    value={newProp.price}
                    onChange={(e) => setNewProp((p) => ({ ...p, price: e.target.value }))}
                    className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                    placeholder="e.g. ₹4.2 Cr"
                    data-testid="input-new-price"
                  />
                </div>
                <div>
                  <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">Status</label>
                  <select
                    value={newProp.status}
                    onChange={(e) => setNewProp((p) => ({ ...p, status: e.target.value }))}
                    className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                    data-testid="select-new-status"
                  >
                    <option value="Available">Available</option>
                    <option value="Sold Out">Sold Out</option>
                  </select>
                </div>
                <div>
                  <label className="text-white/40 text-xs tracking-widest uppercase block mb-1">Image URL (optional)</label>
                  <input
                    type="text"
                    value={newProp.image_url}
                    onChange={(e) => setNewProp((p) => ({ ...p, image_url: e.target.value }))}
                    className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                    placeholder="https://..."
                    data-testid="input-new-image-url"
                  />
                </div>
              </div>

              <ImageUploader
                onUploaded={(url) => setNewProp((p) => ({ ...p, image_url: url }))}
                currentUrl={newProp.image_url}
              />

              <div className="flex gap-3 mt-5">
                <button
                  onClick={handleCreate}
                  disabled={createProperty.isPending || !newProp.title || !newProp.price}
                  className="bg-[#D4AF37] text-black font-bold text-xs tracking-widest uppercase px-6 py-2.5 hover:bg-[#e8c94a] disabled:opacity-50 disabled:cursor-not-allowed"
                  data-testid="btn-create-property"
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
                  data-testid={`admin-property-${p.id}`}
                >
                  {editingId === p.id ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/30 text-xs mb-1 block">Title</label>
                        <input
                          type="text"
                          value={editForm.title ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                          className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                          data-testid="input-edit-title"
                        />
                      </div>
                      <div>
                        <label className="text-white/30 text-xs mb-1 block">Price</label>
                        <input
                          type="text"
                          value={editForm.price ?? ""}
                          onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                          className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                          data-testid="input-edit-price"
                        />
                      </div>
                      <div>
                        <label className="text-white/30 text-xs mb-1 block">Status</label>
                        <select
                          value={editForm.status ?? "Available"}
                          onChange={(e) => setEditForm((f) => ({ ...f, status: e.target.value }))}
                          className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                          data-testid="select-edit-status"
                        >
                          <option value="Available">Available</option>
                          <option value="Sold Out">Sold Out</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-white/30 text-xs mb-1 block">Image URL</label>
                        <input
                          type="text"
                          value={imageUrls[p.id] ?? editForm.image_url ?? ""}
                          onChange={(e) =>
                            setImageUrls((prev) => ({ ...prev, [p.id]: e.target.value }))
                          }
                          className="w-full bg-black border border-white/20 text-white px-3 py-2 text-sm focus:outline-none focus:border-[#D4AF37]"
                          data-testid="input-edit-image-url"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <ImageUploader
                          onUploaded={(url) =>
                            setImageUrls((prev) => ({ ...prev, [p.id]: url }))
                          }
                          currentUrl={imageUrls[p.id] ?? editForm.image_url ?? ""}
                        />
                      </div>
                      <div className="sm:col-span-2 flex gap-3">
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
                        {p.image_url ? (
                          <img
                            src={p.image_url}
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
                          data-testid={`btn-toggle-status-${p.id}`}
                        >
                          {p.status}
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

              {properties?.length === 0 && (
                <div className="border border-white/10 p-10 text-center">
                  <p className="text-white/30 font-serif mb-2">No properties yet.</p>
                  <p className="text-white/20 text-xs">Click "Add Property" to create your first listing.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
