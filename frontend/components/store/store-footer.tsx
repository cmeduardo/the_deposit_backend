import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Phone, MapPin } from "lucide-react";

export function StoreFooter() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="The Deposit"
                width={64}
                height={64}
                className="h-16 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Tu tienda de confianza en La Antigua Guatemala. Productos de calidad al mejor precio desde 2025.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold">Enlaces</h3>
            <ul className="mt-4 space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-muted-foreground hover:text-foreground">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/registro" className="text-muted-foreground hover:text-foreground">
                  Registrarse
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold">Contacto</h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Calle Real Lote 25, Aldea San Pedro Las Huertas, La Antigua Guatemala
                </span>
              </li>
              <li>
                <a
                  href="tel:54204805"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Phone className="h-4 w-4" />
                  <span>5420-4805</span>
                </a>
              </li>
            </ul>
            <div className="mt-4 flex gap-4">
              <a
                href="https://facebook.com/the.deposit."
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/deposit.the"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t pt-6 text-center text-sm text-muted-foreground">
          <p>
            {new Date().getFullYear()} The Deposit. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
