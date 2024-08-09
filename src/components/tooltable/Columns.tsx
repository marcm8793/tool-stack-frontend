import { ColumnDef } from "@tanstack/react-table";
import { DevTool } from "@/types";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Badge } from "../ui/badge";

export const columns: ColumnDef<DevTool>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("name")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "category",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Category" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("category")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "badges",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Features" />
    ),
    cell: ({ row }) => {
      const badges: string[] = row.getValue("badges");
      return (
        <div className="flex flex-wrap gap-1">
          {badges.map((badge, index) => (
            <Badge key={index} variant="secondary">
              {badge}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: "github_stars",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Github Stars" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("github_stars")}
          </span>
        </div>
      );
    },
  },
];
