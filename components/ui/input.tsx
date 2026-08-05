/**
 * The one place the pixel input look is defined. Shared by the auth forms and
 * the quiz builder so they can't drift apart.
 */
export const inputClass =
  "w-full rounded-none border-2 border-dashed border-[rgba(123,47,255,0.4)] bg-[#0A0A0F] px-4 py-3 text-white placeholder:text-white/25 outline-none transition-colors focus:border-[#7B2FFF] disabled:opacity-50";

export const inputErrorClass = "border-solid border-[#FF4D4D]";

export const labelClass =
  "font-pixel block text-[9px] uppercase tracking-wider text-white/60";
