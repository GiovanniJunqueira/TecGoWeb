export class Formatter {
  public static formatPathname(pathname: string): string {
    const words = pathname
      .replace(/^\//, "") 
      .split("/") 
      .flatMap((segment) => segment.split("-")); 

    const formatted = words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) 
      .join(" ");

    return formatted || "Página Inicial";
  }
}
