import { ColumnDef } from "@tanstack/react-table";
import { Category, DevTool } from "@/types";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Badge } from "../ui/badge";
import { Link } from "react-router-dom";
import { DocumentReference } from "firebase/firestore";

export const columns = (categories: Category[]): ColumnDef<DevTool>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const id: string = row.original.id;
      return (
        <div className="flex space-x-2 ">
          <Link to={`/tools/${id}`} className="text-blue-500 hover:underline">
            <span className="max-w-[500px] truncate font-medium">
              {row.getValue("name")}
            </span>
          </Link>
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
      const categoryRef = row.getValue("category") as DocumentReference;
      const categoryId = categoryRef.id;
      const category = categories.find((cat) => cat.id === categoryId);
      const categoryName = category ? category.name : "Uncategorized";

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {categoryName}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const categoryRef = row.getValue(id) as DocumentReference;
      return value.includes(categoryRef.id);
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
