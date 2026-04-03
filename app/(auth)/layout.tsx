export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--color-bg-primary)] noise-overlay">
      {children}
    </div>
  );
}
