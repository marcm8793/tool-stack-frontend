import { Cross2Icon, HeartIcon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Category, EcoSystem } from "@/types/index";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  categories: Category[];
  ecosystems: EcoSystem[];
  showFavorites: boolean;
  onToggleFavorites: () => void;
}

export function DataTableToolbar<TData>({
  table,
  categories,
  ecosystems,
  showFavorites,
  onToggleFavorites,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  const categoryOptions = categories.map((category) => ({
    label: category.name,
    value: category.id,
  }));

  const ecosystemOptions = ecosystems.map((ecosystem) => ({
    label: ecosystem.name,
    value: ecosystem.id,
  }));

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-1">
      <div className="flex flex-col sm:flex-row sm:flex-1 gap-2">
        <Input
          placeholder="Filter tools'name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-full sm:w-[150px] lg:w-[250px]"
        />

        <div className="flex flex-col sm:flex-row sm:justify-between gap-2 w-full">
          <div className="flex justify-between sm:justify-start gap-1 sm:gap-2">
            {table.getColumn("category") && (
              <DataTableFacetedFilter
                column={table.getColumn("category")}
                title="Category"
                options={categoryOptions}
                className="h-7 sm:h-8 text-xs sm:text-sm"
              />
            )}
            {table.getColumn("ecosystem") && (
              <DataTableFacetedFilter
                column={table.getColumn("ecosystem")}
                title="Ecosystem"
                options={ecosystemOptions}
                className="h-7 sm:h-8 text-xs sm:text-sm"
              />
            )}
          </div>

          <div className="flex justify-center sm:justify-end gap-1 sm:gap-2">
            <Button
              variant={showFavorites ? "default" : "outline"}
              size="sm"
              className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
              onClick={onToggleFavorites}
            >
              <HeartIcon className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Favorites
            </Button>

            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => table.resetColumnFilters()}
                className="h-7 sm:h-8 text-xs sm:text-sm px-2 sm:px-3"
              >
                Reset
                <Cross2Icon className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
