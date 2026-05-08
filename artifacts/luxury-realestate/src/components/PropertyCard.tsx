import { motion } from "framer-motion";
import type { Property } from "@/lib/properties";
import { getThumb } from "@/lib/properties";

interface PropertyCardProps {
  property: Property;
  index?: number;
  onClick?: (property: Property) => void;
}

export default function PropertyCard({ property, index = 0, onClick }: PropertyCardProps) {
  const isSoldOut = property.status !== "Available";
  const thumb = getThumb(property);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`group relative bg-[#0a0a0a] border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-500 overflow-hidden ${onClick ? "cursor-pointer" : ""}`}
      onClick={() => onClick?.(property)}
      data-testid={`card-property-${property.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {thumb ? (
          <img
            src={thumb}
            alt={property.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            data-testid={`img-property-${property.id}`}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#111] to-[#1a1a1a] flex items-center justify-center">
            <span className="text-white/10 font-serif text-5xl">E</span>
          </div>
        )}

        {isSoldOut && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="border-2 border-[#D4AF37] text-[#D4AF37] font-serif text-xl px-6 py-2 tracking-[0.3em] rotate-[-8deg]">
              SOLD OUT
            </span>
          </div>
        )}

        {!isSoldOut && (
          <div className="absolute top-3 left-3">
            <span className="bg-[#D4AF37] text-black text-[10px] font-bold tracking-widest uppercase px-2.5 py-1">
              Available
            </span>
          </div>
        )}

        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 text-white/60 text-[10px] px-2 py-0.5">
            {property.images.length} photos
          </div>
        )}

        {onClick && (
          <div className="absolute inset-0 bg-[#D4AF37]/0 group-hover:bg-[#D4AF37]/5 transition-all duration-500 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white/80 text-xs tracking-widest uppercase bg-black/60 px-4 py-2 border border-white/20">
              View Details
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3
            className="font-serif text-lg text-white leading-tight"
            data-testid={`text-title-${property.id}`}
          >
            {property.title}
          </h3>
          <span
            className="text-[#D4AF37] font-bold text-lg whitespace-nowrap"
            data-testid={`text-price-${property.id}`}
          >
            {property.price}
          </span>
        </div>

        {property.location && (
          <p className="text-white/40 text-xs mb-3 truncate">{property.location}</p>
        )}

        <div className="pt-3 border-t border-white/10 flex items-center justify-between">
          <span
            className={`text-xs tracking-widest uppercase font-medium ${
              isSoldOut ? "text-red-400" : "text-green-400"
            }`}
          >
            {property.status}
          </span>
          <span
            className="text-[#D4AF37] text-xs tracking-widest uppercase hover:underline"
            data-testid={`btn-enquire-${property.id}`}
          >
            {onClick ? "View Details →" : "Enquire"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
