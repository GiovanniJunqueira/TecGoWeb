import { LayoutContent } from "@/layouts/layout.content";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonPageComponent() {
  return (
    <LayoutContent className="p-6 space-y-6 h-full">
      <Skeleton className="h-8 w-1/3 mb-2" />

      <div className="flex gap-4 mb-4">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-6 w-1/4" />
      </div>

      <div className="border rounded-lg overflow-hidden flex-1 flex flex-col h-full">
        <div className="flex bg-accent px-4 py-2 ">
          <Skeleton className="h-6 w-1/6 mr-4 bg-accent-foreground" />
          <Skeleton className="h-6 w-1/4 mr-4 bg-accent-foreground" />
          <Skeleton className="h-6 w-1/4 mr-4 bg-accent-foreground" />
          <Skeleton className="h-6 w-1/6 bg-accent-foreground" />
        </div>
        <div className="flex-1 flex flex-col">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="flex px-4 py-3 border-t items-center flex-1"
            >
              <Skeleton className="h-5 w-1/6 mr-4" />
              <Skeleton className="h-5 w-1/4 mr-4" />
              <Skeleton className="h-5 w-1/4 mr-4" />
              <Skeleton className="h-5 w-1/6" />
            </div>
          ))}
        </div>
      </div>
    </LayoutContent>
  );
}
