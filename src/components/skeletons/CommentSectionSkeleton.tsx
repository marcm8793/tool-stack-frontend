import React from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const CommentSkeleton = ({ replies = 0 }) => (
  <div className="space-y-2 mb-4">
    <div className="flex items-start space-x-2 sm:space-x-3 bg-white dark:bg-gray-900 p-2 sm:p-3 md:p-4 rounded-lg shadow-sm">
      <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-4 w-24 mb-1 sm:mb-0" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-4 w-full mt-2" />
        <Skeleton className="h-4 w-3/4 mt-1" />
        <Skeleton className="h-6 w-12 mt-2" />
      </div>
    </div>
    {replies > 0 && (
      <div className="ml-2 sm:ml-4 md:ml-6">
        {[...Array(replies)].map((_, index) => (
          <CommentSkeleton key={index} />
        ))}
      </div>
    )}
  </div>
);

const CommentSectionSkeleton = () => {
  return (
    <div className="container w-full sm:w-10/12 md:w-8/12 lg:w-6/12 mt-4 sm:mt-6 md:mt-8 px-2 sm:px-0">
      <Skeleton className="h-8 w-32 mb-3 sm:mb-4" />
      <div className="mb-4 sm:mb-6">
        <Textarea
          disabled
          placeholder="Write a comment..."
          className="mb-2 text-sm dark:bg-gray-700 dark:text-gray-200"
          rows={4}
        />
        <Button disabled>Post Comment</Button>
      </div>
      <div className="space-y-3 sm:space-y-4">
        <CommentSkeleton replies={1} />
        <CommentSkeleton replies={2} />
        <CommentSkeleton />
        <CommentSkeleton />
      </div>
    </div>
  );
};

export default CommentSectionSkeleton;
