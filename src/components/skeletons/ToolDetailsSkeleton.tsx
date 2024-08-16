import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

const ToolDetailsSkeleton = () => {
  return (
    <div className="md:container mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <Button className="mb-6" variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to List
      </Button>
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-4">
            <Skeleton className="w-20 h-20 rounded" />
            <div className="text-center sm:text-left flex-grow w-full">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <Skeleton className="h-8 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2 mb-1" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full mt-1" />
            </div>

            <div>
              <Skeleton className="h-6 w-1/4 mb-2" />
              <div className="flex flex-wrap gap-2 mt-2">
                {[1, 2, 3, 4].map((_, index) => (
                  <Skeleton key={index} className="h-6 w-20" />
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-32" />
            </div>

            <div>
              <Skeleton className="h-6 w-1/4 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="mt-8">
        <Skeleton className="h-8 w-1/4 mb-4" />
        <Skeleton className="h-24 w-full mb-4" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
};

export default ToolDetailsSkeleton;
