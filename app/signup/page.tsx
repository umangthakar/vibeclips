import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your account — QuizStar",
  description: "Make quizzes, share them to your Story, earn from every play.",
};

export default function SignupPage() {
  return (
    <AuthShell
      kicker="New creator"
      title="Start earning."
      subtitle="Make a quiz, drop the link in your Story, keep 70% of every play."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="nav-link text-white hover:text-white">
            Log in
          </Link>
        </>
      }
    >
      <SignupForm />
    </AuthShell>
  );
}
