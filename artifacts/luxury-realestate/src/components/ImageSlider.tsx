import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ImageSliderProps {
  images: string[];
  title?: string;
}

export default function ImageSlider({ images, title }: ImageSliderProps) {
  const [current, setCurrent] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-[#111] to-[#1a1a1a] flex items-center justify-center">
        <span className="text-white/10 font-serif text-7xl">E</span>
      </div>
    );
  }

  const prev = () => setCurrent((c) => (c === 0 ? images.length - 1 : c - 1));
  const next = () => setCurrent((c) => (c === images.length - 1 ? 0 : c + 1));

  return (
    <div className="relative w-full h-full overflow-hidden bg-black">
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={images[current]}
          alt={title ?? "Property"}
          className="w-full h-full object-cover"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/90 border border-white/20 hover:border-[#D4AF37]/60 flex items-center justify-center text-white transition-all z-10"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/60 hover:bg-black/90 border border-white/20 hover:border-[#D4AF37]/60 flex items-center justify-center text-white transition-all z-10"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i === current ? "bg-[#D4AF37] w-4" : "bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>

          <div className="absolute top-3 right-3 bg-black/60 text-white/60 text-xs px-2 py-1 z-10">
            {current + 1} / {images.length}
          </div>
        </>
      )}
    </div>
  );
}
