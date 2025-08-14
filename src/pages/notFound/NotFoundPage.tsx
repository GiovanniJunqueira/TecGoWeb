import { Button } from "@/components/ui/button";
import { HomeIcon } from "lucide-react";
import { Link } from "react-router-dom";

export  function NotFoundPage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-md text-center px-4">
        <div className="mb-6">
          <h1 className="text-7xl font-bold mb-2">404</h1>
          <div className="h-1 w-20 bg-primary mx-auto rounded-full"></div>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Página não encontrada</h2>

        <p className="text-muted-foreground mb-8">
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
  );
}
