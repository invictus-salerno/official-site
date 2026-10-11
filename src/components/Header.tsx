"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { assetPath, navigation } from "@/lib/site";

export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);

  return (
    <header
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <a
        className="brand"
        href="#top"
        aria-label="ASD Invictus Salerno, inizio"
        onClick={() => setOpen(false)}
      >
        <Image src={assetPath("logo.png")} alt="" width={64} height={58} />
        <span>INVICTUS</span>
      </a>
      <div className="header-actions">
        <button
          ref={toggle}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? "Chiudi menu" : "Apri menu"}
          onClick={() => setOpen(!open)}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            {open ? (
              <path d="m6 6 12 12M6 18 18 6" />
            ) : (
              <path d="M3 6h18M3 12h18M3 18h18" />
            )}
          </svg>
        </button>
      </div>
      <nav
        id="primary-navigation"
        aria-label="Navigazione principale"
        className={open ? "is-open" : ""}
      >
        {navigation.map(({ href, label }) => (
          <a key={href} href={href} onClick={() => setOpen(false)}>
            {label}
          </a>
        ))}
      </nav>
    </header>
  );
}
