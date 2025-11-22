export default function DashboardLayout({ children }) {
  return (
    <div className="bg-background relative min-h-screen">
      <div className="relative z-10 min-h-screen bg-background">{children}</div>
    </div>
  );
}
