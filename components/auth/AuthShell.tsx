import Image from "next/image";
import Link from "next/link";

/** Centred pixel card used by both the login and signup screens. */
export function AuthShell({
  kicker,
  title,
  subtitle,
  children,
  footer,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-5 py-16">
      {/* soft brand glow behind the card */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 animate-pulse-glow rounded-full bg-[#7B2FFF] opacity-20 blur-[120px]"
      />

      <div className="relative w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <Image
            src="/logo.png"
            alt="QuizStar"
            width={36}
            height={36}
            className="h-9 w-9"
          />
          <span className="font-pixel text-sm text-white">QuizStar</span>
        </Link>

        <div className="pixel-border-glow bg-[#13131C] p-8 sm:p-10">
          <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
            // {kicker}
          </span>
          <h1 className="mt-4 font-pixel text-lg leading-[1.5] text-white">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            {subtitle}
          </p>

          <div className="mt-8">{children}</div>
        </div>

        <p className="mt-6 text-center text-sm text-white/50">{footer}</p>
      </div>
    </main>
  );
}
