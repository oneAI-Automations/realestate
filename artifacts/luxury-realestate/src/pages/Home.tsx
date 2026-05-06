import { motion } from "framer-motion";
import { MessageCircle, ChevronDown, Dumbbell, Car, Trees, Waves, Shield, ConciergeBell } from "lucide-react";
import { Link } from "wouter";
import { useGetFeaturedProperties, useGetSpecialOffer } from "@workspace/api-client-react";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";

const amenities = [
  { icon: Dumbbell, label: "Premium Gym" },
  { icon: Car, label: "Secure Parking" },
  { icon: Trees, label: "Landscaped Garden" },
  { icon: Waves, label: "Infinity Pool" },
  { icon: Shield, label: "24/7 Security" },
  { icon: ConciergeBell, label: "Concierge" },
];

function MarqueeBanner({ text }: { text: string }) {
  return (
    <div className="bg-[#D4AF37]/10 border-y border-[#D4AF37]/30 py-3 overflow-hidden">
      <div className="flex whitespace-nowrap">
        <motion.div
          className="flex gap-16 text-[#D4AF37] text-xs font-medium tracking-[0.2em] uppercase"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        >
          {[...Array(6)].map((_, i) => (
            <span key={i}>{text}</span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: featured, isLoading } = useGetFeaturedProperties();
  const { data: offerData } = useGetSpecialOffer();

  const specialOfferText =
    offerData?.text ||
    "Exclusive Launch Offer — Limited Units Available in Pune's Most Prestigious Development — Register Now for Priority Access";

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero */}
      <section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 text-center overflow-hidden"
        data-testid="section-hero"
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&auto=format&fit=crop')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black" />

        <motion.div
          className="relative z-10 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <p className="text-[#D4AF37] text-xs tracking-[0.5em] uppercase mb-6 font-medium">
            Pune's Most Prestigious Developments
          </p>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none mb-6">
            Live Beyond
            <br />
            <span className="text-[#D4AF37]">Ordinary</span>
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            Ultra-luxury residences crafted for those who demand nothing less than
            perfection. Welcome to Elite Estates.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#20b858] transition-colors min-w-[220px] justify-center"
              data-testid="btn-whatsapp-hero"
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </a>
            <Link
              href="/properties"
              className="inline-flex items-center gap-2 border border-[#D4AF37] text-[#D4AF37] font-bold text-sm tracking-widest uppercase px-8 py-4 hover:bg-[#D4AF37] hover:text-black transition-all min-w-[220px] justify-center"
              data-testid="btn-view-properties"
            >
              View Properties
            </Link>
          </div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <ChevronDown size={24} className="text-[#D4AF37]/50" />
        </motion.div>
      </section>

      {/* Marquee Banner */}
      <MarqueeBanner text={specialOfferText} />

      {/* Featured Properties */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto" data-testid="section-featured">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-[#D4AF37] text-xs tracking-[0.5em] uppercase mb-3">
            Handpicked for You
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white">
            Featured Residences
          </h2>
          <div className="mt-4 h-px w-16 bg-[#D4AF37] mx-auto" />
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="aspect-[4/3] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : featured && featured.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p, i) => (
              <PropertyCard key={p.id} property={p} index={i} />
            ))}
          </div>
        ) : (
          <p className="text-center text-white/30 py-12">No featured properties available.</p>
        )}

        <div className="text-center mt-12">
          <Link
            href="/properties"
            className="inline-block border border-[#D4AF37]/50 text-[#D4AF37] text-xs tracking-widest uppercase px-10 py-3.5 hover:bg-[#D4AF37] hover:text-black transition-all"
            data-testid="btn-all-properties"
          >
            View All Properties
          </Link>
        </div>
      </section>

      {/* Amenities */}
      <section className="py-24 bg-[#050505] border-y border-white/5" data-testid="section-amenities">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-14"
          >
            <p className="text-[#D4AF37] text-xs tracking-[0.5em] uppercase mb-3">
              World-Class Lifestyle
            </p>
            <h2 className="font-serif text-4xl sm:text-5xl text-white">
              Signature Amenities
            </h2>
            <div className="mt-4 h-px w-16 bg-[#D4AF37] mx-auto" />
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {amenities.map((a, i) => (
              <motion.div
                key={a.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col items-center gap-4 py-8 px-4 border border-white/5 hover:border-[#D4AF37]/40 transition-all group"
                data-testid={`amenity-${a.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <a.icon
                  size={28}
                  className="text-[#D4AF37] group-hover:scale-110 transition-transform"
                />
                <span className="text-white/60 text-xs tracking-widest uppercase text-center group-hover:text-white transition-colors">
                  {a.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* WhatsApp CTA */}
      <section className="py-24 px-4 text-center" data-testid="section-cta">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-[#D4AF37] text-xs tracking-[0.5em] uppercase mb-4">
            Begin Your Journey
          </p>
          <h2 className="font-serif text-4xl sm:text-5xl text-white mb-4">
            Your Dream Home Awaits
          </h2>
          <p className="text-white/50 text-base max-w-md mx-auto mb-10">
            Speak directly with our exclusive sales team. Schedule a private
            viewing today.
          </p>
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold text-sm tracking-widest uppercase px-10 py-5 hover:bg-[#20b858] transition-colors"
            data-testid="btn-whatsapp-cta"
          >
            <MessageCircle size={20} />
            Connect on WhatsApp
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 px-4 text-center">
        <p className="font-serif text-[#D4AF37] text-lg mb-1">Elite Estates</p>
        <p className="text-white/30 text-xs tracking-wider">
          Pune's Most Prestigious Developments — samplewebsite.replit.app
        </p>
        <p className="text-white/20 text-xs mt-4">
          &copy; {new Date().getFullYear()} Elite Estates. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
