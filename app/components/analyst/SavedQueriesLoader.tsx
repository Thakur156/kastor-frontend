import { Skeleton } from "~/components/ui/skeleton";

export function SavedQueriesLoader() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-7">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((_, index) => (
        <div
          key={index}
          className="bg-gray-200 border border-Stroke rounded-[20px] py-7 px-5"
        >
          <Skeleton className="h-7 w-2/3 rounded-md" />
          <Skeleton className="h-4 w-1/3 mt-2" />
          <Skeleton className="h-4 w-1/4 mt-5" />
          <Skeleton className="h-4 w-2/3 mt-2" />
          <div className="flex justify-end mt-4">
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
