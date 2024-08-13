import { ColumnDef } from "@tanstack/react-table";
import { Category, DevTool, EcoSystem } from "@/types/index";
import { DataTableColumnHeader } from "./data-table-column-header";
import { Badge } from "../ui/badge";
import { Link } from "react-router-dom";
import { DocumentReference } from "firebase/firestore";
import { Heart } from "lucide-react";
import { User } from "@/types/index";
import { motion } from "framer-motion";

interface ColumnsProps {
  categories: Category[];
  ecosystems: EcoSystem[];
  likedTools: string[];
  onLikeToggle: (toolId: string, toolName: string, isLiked: boolean) => void;
  currentUser: User | null;
}

export const columns = ({
  categories,
  ecosystems,
  likedTools,
  onLikeToggle,
  currentUser,
}: ColumnsProps): ColumnDef<DevTool>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => {
      const id: string = row.original.id;
      const name: string = row.getValue("name");
      return (
        <div className="flex space-x-2 ">
          <Link to={`/tools/${id}`} className="text-blue-500 hover:underline">
            <span className="max-w-[500px] truncate font-medium">{name}</span>
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
    sortingFn: (rowA, rowB, columnId) => {
      const getCategoryName = (row: {
        getValue: (columnId: string) => DocumentReference;
      }) => {
        const categoryRef = row.getValue(columnId) as DocumentReference;
        const categoryId = categoryRef.id;
        const category = categories.find((cat) => cat.id === categoryId);
        return category ? category.name : "Uncategorized";
      };
      const categoryA = getCategoryName(rowA);
      const categoryB = getCategoryName(rowB);
      return categoryA.localeCompare(categoryB);
    },
    filterFn: (row, id, value) => {
      const categoryRef = row.getValue(id) as DocumentReference;
      return value.includes(categoryRef.id);
    },
  },
  {
    accessorKey: "ecosystem",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Ecosystem" />
    ),
    cell: ({ row }) => {
      const ecosystemRef = row.getValue("ecosystem") as DocumentReference;
      const ecosystemId = ecosystemRef.id;
      const ecosystem = ecosystems.find((eco) => eco.id === ecosystemId);
      const ecosystemName = ecosystem ? ecosystem.name : "Uncategorized";

      return (
        <div className="flex space-x-2">
          <span className="max-w-[500px] truncate font-medium">
            {ecosystemName}
          </span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      const ecosystemRef = row.getValue(id) as DocumentReference;
      return value.includes(ecosystemRef.id);
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
        <div className="flex space-x-2">
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
  {
    id: "actions",
    cell: ({ row }) => {
      const tool = row.original;
      const isLiked = likedTools.includes(tool.id);

      const handleLikeClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!currentUser) {
          // Handle not logged in state (e.g., show login prompt)
          console.log("User not logged in");
          return;
        }
        onLikeToggle(tool.id, tool.name, !isLiked);
      };

      if (!currentUser) {
        return null; // Don't render the heart if the user is not logged in
      }

      return (
        <div
          className={`flex justify-end transition-opacity duration-200 ${
            isLiked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ scale: isLiked ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.3 }}
          >
            <Heart
              className={`h-5 w-5 cursor-pointer ${
                isLiked ? "text-red-500 fill-current" : "text-gray-300"
              }`}
              onClick={handleLikeClick}
            />
          </motion.div>
        </div>
      );
    },
  },
];
