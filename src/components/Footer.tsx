import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer>
      <div className="footer-socials">
        <a
          href={site.instagram}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Instagram di ASD Invictus Salerno"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
            focusable="false"
          >
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle
              cx="17.5"
              cy="6.5"
              r="1"
              fill="currentColor"
              stroke="none"
            />
          </svg>
        </a>
        <a
          href={site.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat WhatsApp con Maestro Andrea Romano"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
          >
            <path
              d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 21l1.7-4.8A8.5 8.5 0 1 1 20.5 11.7Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <path
              d="M8.2 7.5c.2-.4.4-.4.6-.4h.5c.2 0 .3.1.4.4l.7 1.7c.1.3.1.4 0 .6l-.6.8c-.1.1-.2.3 0 .5.7 1.2 1.6 2.1 2.9 2.7.2.1.4.1.5-.1l.9-1.1c.2-.2.3-.2.5-.1l1.8.8c.3.1.4.2.4.4 0 .3-.2 1.3-.8 1.7-.5.4-1.2.6-2 .4-1.2-.3-2.8-1-4.5-2.5C8.2 11.8 7.4 10 7.4 9c0-.7.3-1.2.8-1.5Z"
              fill="currentColor"
            />
          </svg>
        </a>
      </div>
      <a href="#top">Torna su ↑</a>
      <p className="footer-signature">ASD Invictus since 2015</p>
    </footer>
  );
}
