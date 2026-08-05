export function FormError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p
      role="alert"
      className="border-2 border-solid border-[#FF4D4D] bg-[#FF4D4D]/10 px-4 py-3 text-sm text-[#FF7A7A]"
    >
      {message}
    </p>
  );
}
