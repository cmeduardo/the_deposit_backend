import { StoreHeader } from "@/components/store/store-header";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <footer className="border-t py-8 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>El Depósito - Tu distribuidor de confianza</p>
          <p className="mt-1">Sistema de pedidos en línea</p>
        </div>
      </footer>
    </div>
  );
}
