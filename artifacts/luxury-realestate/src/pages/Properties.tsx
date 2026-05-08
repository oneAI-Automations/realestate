import { useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, SlidersHorizontal } from "lucide-react";
import { useProperties, type Property } from "@/lib/properties";
import { isSupabaseConfigured } from "@/lib/supabase";
import PropertyCard from "@/components/PropertyCard";
import PropertyDetailModal from "@/components/PropertyDetailModal";
import Navbar from "@/components/Navbar";

export default function Properties() {
  const [filter, setFilter] = useState<"all" | "Available" | "Sold Out">("all");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  const { data: properties, isLoading } = useProperties(
    filter === "all" ? undefined : filter
  );

  const filters: { key: typeof filter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "Available", label: "Available" },
    { key: "Sold Out", label: "Sold Out" },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Page Header */}
      <div className="relative pt-32 pb-16 px-4 text-center border-b border-white/10">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200&auto=format&fit=crop')",
          }}
        />
        <div className="relative z-10">
          <p className="text-[#D4AF37] text-xs tracking-[0.5em] uppercase mb-3">
            Our Portfolio
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl text-white mb-2">
            All Properties
          </h1>
          <div className="mt-4 h-px w-16 bg-[#D4AF37] mx-auto" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Filters */}
        <div className="flex items-center gap-3 mb-10 flex-wrap">
          <SlidersHorizontal size={15} className="text-[#D4AF37]" />
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`text-xs tracking-widest uppercase px-5 py-2.5 border transition-all min-h-[44px] ${
                filter === f.key
                  ? "border-[#D4AF37] bg-[#D4AF37] text-black font-bold"
                  : "border-white/20 text-white/60 hover:border-[#D4AF37]/50 hover:text-white"
              }`}
              data-testid={`filter-${f.key}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!isSupabaseConfigured ? (
          <div className="text-center py-20 border border-white/10">
            <p className="text-white/30 font-serif text-lg mb-2">Supabase not connected</p>
            <p className="text-white/20 text-sm">Add your Supabase credentials to display live properties.</p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((p, i) => (
              <PropertyCard
                key={p.id}
                property={p}
                index={i}
                onClick={setSelectedProperty}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg font-serif">No properties found.</p>
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 text-center py-12 border border-white/10"
        >
          <p className="font-serif text-2xl text-white mb-2">
            Didn't find what you're looking for?
          </p>
          <p className="text-white/40 text-sm mb-6">
            Our team can help you find your perfect luxury residence.
          </p>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#20b858] transition-colors"
            data-testid="btn-whatsapp-properties"
          >
            <MessageCircle size={18} />
            WhatsApp Us
          </a>
        </motion.div>
      </div>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
      />
    </div>
  );
}
