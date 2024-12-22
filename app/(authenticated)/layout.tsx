import Nav from "@/components/layout/nav";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Nav />
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
} 