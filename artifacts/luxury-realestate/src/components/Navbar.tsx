import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home" },
    { href: "/properties", label: "Properties" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-[#D4AF37]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-[#D4AF37] font-serif text-xl font-bold tracking-wider">
              ELITE ESTATES
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm tracking-widest uppercase transition-colors ${
                  location === l.href
                    ? "text-[#D4AF37]"
                    : "text-white/70 hover:text-[#D4AF37]"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#D4AF37] text-black text-xs font-bold tracking-widest uppercase px-5 py-2.5 hover:bg-[#e8c94a] transition-colors"
              data-testid="nav-whatsapp"
            >
              Enquire Now
            </a>
          </div>

          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
            data-testid="nav-mobile-toggle"
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-black border-t border-[#D4AF37]/20 px-4 py-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className={`text-sm tracking-widest uppercase ${
                location === l.href ? "text-[#D4AF37]" : "text-white/70"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <a
            href="https://wa.me/919999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#D4AF37] text-black text-xs font-bold tracking-widest uppercase px-5 py-3 text-center"
          >
            Enquire Now
          </a>
        </div>
      )}
    </nav>
  );
}
