"use client";

import { useState } from "react";
import Link from "next/link";

function Logo() {
  return (
    <span className="flex items-center gap-[11px]">
      <span
        style={{
          width: 34,
          height: 34,
          borderRadius: 9,
          background: "#CC1F1F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(204,31,31,0.28)",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            display: "block",
            width: 13,
            height: 13,
            border: "3px solid #fff",
            borderRadius: "50%",
            borderRightColor: "transparent",
            transform: "rotate(-45deg)",
          }}
        />
      </span>
      <span
        style={{
          fontSize: 21,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#1a1414",
        }}
      >
        Maxi<span style={{ color: "#CC1F1F" }}>Learn</span>
      </span>
    </span>
  );
}

const navLinks = [
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Planos", href: "#planos" },
  { label: "Contato", href: "#contato" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-[#f4eded] w-full sticky top-0 z-50">
      <nav
        className="flex items-center justify-between gap-4 px-5 md:px-10 lg:px-16 py-[18px] max-w-[1320px] w-full mx-auto"
        aria-label="Navegação principal"
      >
        <Link href="/" className="no-underline">
          <Logo />
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-10">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#4a4040",
                textDecoration: "none",
              }}
              className="hover:text-[#CC1F1F] transition-colors duration-150"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-[14px]">
          <Link
            href="/login"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#1a1414",
              textDecoration: "none",
              padding: "10px 6px",
            }}
          >
            Entrar
          </Link>
          <Link
            href="/cadastro"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              textDecoration: "none",
              background: "#CC1F1F",
              padding: "11px 22px",
              borderRadius: 10,
              boxShadow: "0 6px 16px rgba(204,31,31,0.26)",
            }}
            className="hover:opacity-90 transition-opacity"
          >
            Começar grátis
          </Link>
        </div>

        {/* Hamburger */}
        <button
          className="md:hidden flex flex-col gap-[5px] p-2 -mr-2 cursor-pointer bg-transparent border-none"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
        >
          <span
            className={`block w-6 h-0.5 bg-[#1a1414] transition-all duration-200 origin-center ${
              open ? "rotate-45 translate-y-[7px]" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#1a1414] transition-all duration-200 ${
              open ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#1a1414] transition-all duration-200 origin-center ${
              open ? "-rotate-45 -translate-y-[7px]" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#f4eded] bg-white px-5 py-6 flex flex-col gap-5">
          {navLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#4a4040",
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          ))}
          <div className="flex flex-col gap-3 pt-4 border-t border-[#f4eded]">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#1a1414",
                textDecoration: "none",
              }}
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              onClick={() => setOpen(false)}
              className="text-center"
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: "#fff",
                textDecoration: "none",
                background: "#CC1F1F",
                padding: "13px 22px",
                borderRadius: 10,
              }}
            >
              Começar grátis
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
