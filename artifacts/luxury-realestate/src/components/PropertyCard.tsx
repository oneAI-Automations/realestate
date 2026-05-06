import { BedDouble, Bath, Maximize2 } from "lucide-react";
import { motion } from "framer-motion";

interface Property {
  id: number;
  name: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area_sqft: number;
  description: string;
  image_url: string | null;
  is_sold_out: boolean;
  is_featured: boolean;
  property_type: string;
}

interface PropertyCardProps {
  property: Property;
  index?: number;
}

export default function PropertyCard({ property, index = 0 }: PropertyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative bg-[#0a0a0a] border border-white/10 hover:border-[#D4AF37]/60 transition-all duration-500 overflow-hidden"
      data-testid={`card-property-${property.id}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {property.image_url ? (
          <img
            src={property.image_url}
            alt={property.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            data-testid={`img-property-${property.id}`}
          />
        ) : (
          <div className="w-full h-full bg-[#111] flex items-center justify-center">
            <span className="text-white/20 font-serif text-lg">No Image</span>
          </div>
        )}

        {property.is_sold_out && (
          <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
            <span className="border-2 border-[#D4AF37] text-[#D4AF37] font-serif text-xl px-6 py-2 tracking-[0.3em] rotate-[-8deg]">
              SOLD OUT
            </span>
          </div>
        )}

        <div className="absolute top-3 left-3">
          <span className="bg-[#D4AF37] text-black text-[10px] font-bold tracking-widest uppercase px-2.5 py-1">
            {property.property_type}
          </span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-serif text-lg text-white leading-tight" data-testid={`text-name-${property.id}`}>
            {property.name}
          </h3>
          <span className="text-[#D4AF37] font-bold text-lg whitespace-nowrap" data-testid={`text-price-${property.id}`}>
            {property.price}
          </span>
        </div>

        <p className="text-white/50 text-xs tracking-widest uppercase mb-3">
          {property.location}
        </p>

        <p className="text-white/60 text-sm leading-relaxed mb-4 line-clamp-2">
          {property.description}
        </p>

        <div className="flex items-center gap-4 pt-3 border-t border-white/10 text-white/50 text-xs">
          <span className="flex items-center gap-1.5">
            <BedDouble size={13} className="text-[#D4AF37]" />
            {property.bedrooms} Bed
          </span>
          <span className="flex items-center gap-1.5">
            <Bath size={13} className="text-[#D4AF37]" />
            {property.bathrooms} Bath
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize2 size={13} className="text-[#D4AF37]" />
            {property.area_sqft.toLocaleString()} sqft
          </span>
        </div>
      </div>
    </motion.div>
  );
}
