import { Skeleton } from "~/components/ui/skeleton";

const NamespaceItemLoader = () => {
  return (
    <div className="p-[30px] rounded-[20px] border border-[#E5E5E5] w-full">
      {/* Loader for the Namespace Header */}
      <div className="flex items-center gap-2 mb-1 mt-2 font-semibold cursor-pointer">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-5 w-[180px]" />
      </div>
    </div>
  );
};

export default NamespaceItemLoader;
