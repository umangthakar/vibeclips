import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions/auth";
import { requireSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware already redirected anonymous visitors, but it only checks the
  // token's signature. This is the check that the account still exists.
  const session = await requireSession();

  const { data: influencer } = await supabaseAdmin()
    .from("influencers")
    .select("id, name, instagram_handle")
    .eq("id", session.sub)
    .maybeSingle();

  // Valid token, deleted account. /logout clears the cookie — see the note there.
  if (!influencer) redirect("/logout");

  return (
    <div className="min-h-screen">
      <header className="border-b-2 border-dashed border-[rgba(123,47,255,0.35)] bg-[#0A0A0F]/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="QuizStar"
              width={30}
              height={30}
              className="h-[30px] w-[30px]"
            />
            <span className="font-pixel text-xs text-white">QuizStar</span>
          </Link>

          <div className="flex items-center gap-5">
            <span className="hidden text-sm text-white/50 sm:inline">
              @{influencer.instagram_handle}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="nav-link font-pixel text-[9px] uppercase tracking-wider text-white/60 hover:text-white"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
