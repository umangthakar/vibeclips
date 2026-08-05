import Image from "next/image";
import { Instagram, Youtube, Twitter } from "lucide-react";

const socials = [
  { icon: Instagram, label: "Instagram", href: "https://instagram.com" },
  { icon: Youtube, label: "YouTube", href: "https://youtube.com" },
  { icon: Twitter, label: "X / Twitter", href: "https://x.com" },
];

export function Footer() {
  return (
    <footer className="border-t-2 border-dashed border-[rgba(123,47,255,0.3)] bg-[#101018] px-5 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 md:flex-row">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="QuizStar"
            width={1174}
            height={876}
            className="h-8 w-auto"
          />
          <span className="font-pixel text-xs text-white">QuizStar</span>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <p className="font-pixel text-[9px] leading-relaxed text-white/60">
            Built for creators who&apos;d rather not chase brand deals.
          </p>
          <p className="font-pixel text-[9px] leading-relaxed text-white/45">
            &copy; 2026 QuizStar &middot; Powered by{" "}
            <span className="text-grad">VibeChan</span>
          </p>
        </div>

        <div className="flex gap-3">
          {socials.map((social) => (
            <a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={social.label}
              className="grid h-10 w-10 place-items-center border-2 border-dashed border-[rgba(123,47,255,0.4)] text-white/60 transition-colors hover:border-[#FF6A00] hover:text-white"
            >
              <social.icon className="h-4 w-4" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
