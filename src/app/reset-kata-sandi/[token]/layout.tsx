export default function ResetTokenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dynamic route segment - render on demand
  return <>{children}</>;
}