import { Skeleton } from "../ui/skeleton";

const DevToolsSkeleton = () => {
  return (
    <div className="container space-y-4">
      <Skeleton className="h-12 w-[250px]" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-[200px]" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
      <Skeleton className="h-[44px] w-full" />
      <Skeleton className="h-[44px] w-full" />
      <Skeleton className="h-[44px] w-full" />
      <Skeleton className="h-[44px] w-full" />
      <Skeleton className="h-[44px] w-full" />
      <Skeleton className="h-[44px] w-full" />
      <div className="flex space-x-4">
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
        <Skeleton className="h-10 w-[100px]" />
      </div>
    </div>
  );
};

export default DevToolsSkeleton;
