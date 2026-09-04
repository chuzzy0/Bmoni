"use client";

import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const links = [
  { href: "#", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#security", label: "Security" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);

      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, y / max) : 0);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();

    if (href === "#") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    const target = document.querySelector(href);

    if (!target) return;

    const navbarHeight = scrolled ? 64 : 80;
    const targetPosition =
      target.getBoundingClientRect().top + window.scrollY - navbarHeight - 16;

    window.scrollTo({
      top: targetPosition,
      behavior: "smooth",
    });

    window.history.pushState(null, "", href);
  };
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b bg-[#fbfbff]/90 backdrop-blur-xl transition-shadow duration-300 ${scrolled
          ? "border-slate-200/70 shadow-sm shadow-violet-950/5"
          : "border-transparent"
        }`}
    >
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between px-5 transition-[height] duration-300 sm:px-8 ${scrolled ? "h-16" : "h-20"
          }`}
      >
        <Link href="#" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="logo"
            width={200}
            height={200}
            className="h-auto w-40"
          />
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-slate-600 md:flex">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="group relative py-1 transition-colors duration-200 hover:text-slate-950"
            >
              {link.label}
              <span className="absolute -bottom-0.5 left-0 h-[1.5px] w-0 bg-violet-600 transition-all duration-300 group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="https://wa.me/15556162147"
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-white shadow-lg shadow-violet-950/15 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-950/25"
          >
            <span className="sheen-layer" />
            Start Chatting
            <ChevronRight
              size={13}
              className="transition group-hover:translate-x-0.5"
            />
          </a>
        </div>
      </div>

      {/* Scroll progress */}
      <div
        className="h-[2px] bg-linear-to-r from-[#4d0b6e] via-[#9a39d6] to-whatsapp transition-[width] duration-150 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </header>
  );
}