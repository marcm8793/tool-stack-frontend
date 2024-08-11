import { Cross2Icon } from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./data-table-view-options";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { Category, EcoSystem } from "@/types";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  categories: Category[];
  ecosystems: EcoSystem[];
}

export function DataTableToolbar<TData>({
  table,
  categories,
  ecosystems,
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
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        <Input
          placeholder="Filter tools'name"
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("name")?.setFilterValue(event.target.value)
          }
          className="h-8 w-[150px] lg:w-[250px]"
        />
        {table.getColumn("category") && (
          <DataTableFacetedFilter
            column={table.getColumn("category")}
            title="Category"
            options={categoryOptions}
          />
        )}
        {table.getColumn("ecosystem") && (
          <DataTableFacetedFilter
            column={table.getColumn("ecosystem")}
            title="Ecosystem"
            options={ecosystemOptions}
          />
        )}

        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>
      <DataTableViewOptions table={table} />
    </div>
  );
}
