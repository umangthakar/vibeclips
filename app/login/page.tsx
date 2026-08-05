import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — QuizStar",
};

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  // Only ever hand a dashboard path to the form; anything else is ignored so
  // ?next=https://evil.example can't turn login into an open redirect.
  const next =
    searchParams.next?.startsWith("/dashboard") &&
    !searchParams.next.startsWith("//")
      ? searchParams.next
      : undefined;

  return (
    <AuthShell
      kicker="Welcome back"
      title="Log in."
      subtitle="Your handle and PIN. That's it."
      footer={
        <>
          No account yet?{" "}
          <Link href="/signup" className="nav-link text-white hover:text-white">
            Sign up
          </Link>
        </>
      }
    >
      <LoginForm next={next} />
    </AuthShell>
  );
}
