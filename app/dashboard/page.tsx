import type { Metadata } from "next";
import { requireSession } from "@/lib/auth/session";
import { supabaseAdmin } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Dashboard — QuizStar",
};

const money = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
    value
  );

/** Placeholder. Quiz list, quiz builder and earnings detail land in Phase 3. */
export default async function DashboardPage() {
  const session = await requireSession();

  const { data: influencer } = await supabaseAdmin()
    .from("influencers")
    .select("name, instagram_handle, total_earnings, current_balance")
    .eq("id", session.sub)
    .single();

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-14">
      <span className="font-pixel text-[10px] uppercase tracking-wider text-[#FF6A00]">
        // Dashboard
      </span>
      <h1 className="mt-4 font-pixel text-xl leading-[1.5] text-white sm:text-2xl">
        Hey {influencer?.name.split(" ")[0] ?? "there"}.
      </h1>
      <p className="mt-4 max-w-md text-white/55">
        You&apos;re logged in as{" "}
        <span className="text-white">@{influencer?.instagram_handle}</span>.
      </p>

      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:max-w-2xl">
        <div className="pixel-border bg-[#13131C] p-7">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-white/50">
            Unpaid balance
          </span>
          <p className="mt-4 font-pixel text-2xl text-grad">
            {money(influencer?.current_balance ?? 0)}
          </p>
        </div>
        <div className="pixel-border bg-[#13131C] p-7">
          <span className="font-pixel text-[9px] uppercase tracking-wider text-white/50">
            Lifetime earnings
          </span>
          <p className="mt-4 font-pixel text-2xl text-white">
            {money(influencer?.total_earnings ?? 0)}
          </p>
        </div>
      </div>

      <div className="mt-12 border-2 border-dashed border-[rgba(123,47,255,0.4)] p-7">
        <p className="text-sm leading-relaxed text-white/45">
          Quiz builder, shareable links and per-quiz analytics arrive in the next
          phase.
        </p>
      </div>
    </main>
  );
}
