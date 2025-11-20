import { Button } from "@/components/ui/button";
import { LayoutContent } from "@/layouts/layout.content";
import { HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <LayoutContent>
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="max-w-md flex flex-col items-center mx-auto">
          <div className="mb-6 text-center">
            <h1 className="text-7xl font-bold mb-2">404</h1>
            <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
          </div>

          <h2 className="text-2xl font-semibold mb-4 text-center">Página não encontrada</h2>

          <p className="text-muted-foreground mb-8 text-center">
            A página que você está procurando não existe ou foi movida.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild>
              <Link to="/" className="flex items-center gap-2">
                <HomeIcon className="h-4 w-4" />
                <span>Página inicial</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </LayoutContent>
  );
}
