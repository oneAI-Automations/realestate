import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Phone, MessageCircle } from "lucide-react";
import type { Property } from "@/lib/properties";
import { usePropertyAmenities } from "@/lib/amenities";
import ImageSlider from "./ImageSlider";

interface PropertyDetailModalProps {
  property: Property | null;
  onClose: () => void;
}

export default function PropertyDetailModal({ property, onClose }: PropertyDetailModalProps) {
  const { data: amenities } = usePropertyAmenities(property?.id ?? null);

  useEffect(() => {
    if (!property) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [property, onClose]);

  const isSoldOut = property?.status !== "Available";
  const waNumber = property?.contact_number
    ? property.contact_number.replace(/\D/g, "")
    : "919999999999";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(`Hi, I'm interested in ${property?.title ?? "your property"}`)}`;

  return (
    <AnimatePresence>
      {property && (
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          style={{ backgroundColor: "rgba(0,0,0,0.93)" }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative w-full max-w-5xl max-h-[92vh] bg-[#0a0a0a] border border-[#D4AF37]/30 flex flex-col overflow-hidden"
            style={{ height: "min(92vh, 820px)" }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 bg-black/80 border border-white/20 hover:border-[#D4AF37]/60 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              <X size={16} />
            </button>

            {/* Status badge */}
            {!isSoldOut && (
              <div className="absolute top-4 left-4 z-20">
                <span className="bg-[#D4AF37] text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1">
                  Available
                </span>
              </div>
            )}

            {/* Image gallery — ~55% height */}
            <div className="flex-shrink-0" style={{ height: "55%" }}>
              {isSoldOut && (
                <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center" style={{ height: "55%" }}>
                  <span className="border-2 border-[#D4AF37] text-[#D4AF37] font-serif text-2xl px-8 py-3 tracking-[0.3em] rotate-[-6deg] bg-black/50">
                    SOLD OUT
                  </span>
                </div>
              )}
              <ImageSlider images={property.images} title={property.title} />
            </div>

            {/* Content — scrollable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left: Main info */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-white leading-tight mb-2">
                      {property.title}
                    </h2>
                    {property.location && (
                      <div className="flex items-center gap-1.5 text-white/50 text-sm">
                        <MapPin size={13} className="text-[#D4AF37]/70 flex-shrink-0" />
                        {property.location}
                      </div>
                    )}
                    <div className="mt-3 flex items-center gap-4">
                      <span className="text-[#D4AF37] font-bold text-2xl">{property.price}</span>
                      <span className={`text-xs tracking-widest uppercase font-medium ${isSoldOut ? "text-red-400" : "text-green-400"}`}>
                        {property.status}
                      </span>
                    </div>
                    <div className="mt-3 h-px bg-[#D4AF37]/20" />
                  </div>

                  {property.description && (
                    <div>
                      <p className="text-white/30 text-xs tracking-widest uppercase mb-2">About This Property</p>
                      <p className="text-white/70 text-sm leading-relaxed">{property.description}</p>
                    </div>
                  )}

                  {amenities && amenities.length > 0 && (
                    <div>
                      <p className="text-white/30 text-xs tracking-widest uppercase mb-3">Amenities</p>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((a) => (
                          <span
                            key={a.id}
                            className="flex items-center gap-1.5 border border-[#D4AF37]/30 text-white/70 text-xs tracking-wide px-3 py-1.5 hover:border-[#D4AF37]/60 hover:text-white transition-all"
                          >
                            <span>{a.icon}</span>
                            {a.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Contact */}
                <div>
                  <div className="bg-black border border-[#D4AF37]/20 p-5">
                    <p className="text-white/30 text-xs tracking-widest uppercase mb-4">Contact Agent</p>

                    {property.contact_number && (
                      <div className="flex items-center gap-2 mb-4">
                        <Phone size={14} className="text-[#D4AF37]/70 flex-shrink-0" />
                        <a
                          href={`tel:${property.contact_number}`}
                          className="text-white font-medium text-sm hover:text-[#D4AF37] transition-colors"
                        >
                          {property.contact_number}
                        </a>
                      </div>
                    )}

                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold text-xs tracking-widest uppercase px-4 py-3 hover:bg-[#20b858] transition-colors mb-3"
                    >
                      <MessageCircle size={14} />
                      WhatsApp Agent
                    </a>

                    <p className="text-white/20 text-xs text-center leading-relaxed">
                      Schedule a private viewing or request more details via WhatsApp.
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
