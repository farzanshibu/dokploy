import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
} from "@tanstack/react-table";
import { Loader2, PlusCircle } from "lucide-react";
import React, { useState } from "react";

export const createRegexByResourceType = (resourceType: string) => {
  return new RegExp(`No ${resourceType.toLowerCase()} name`, "i");
};

type ShowProps = {
  resourceType: string;
  data: any;
  isLoading: boolean;
  columns: any[];
  customButton?: React.ReactNode;
};

type EmptyStateProps = {
  resourceType: string;
  customButton?: React.ReactNode;
};

const EmptyState: React.FC<EmptyStateProps> = ({
  resourceType,
  customButton,
}) => (
  <div className="flex flex-col items-center justify-center h-64 bg-muted rounded-lg">
    <PlusCircle className="w-16 h-16 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold mb-2">No {resourceType} Available</h3>
    <p className="text-sm text-muted-foreground mb-4">
      Get started by creating your first {resourceType.toLowerCase()}.
    </p>
    {customButton ? customButton : null}
  </div>
);

export const Show: React.FC<ShowProps> = ({
  resourceType,
  data,
  isLoading,
  columns,
  customButton,
}) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const table = useReactTable({
    data: data ?? [],
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  });

  if (isLoading) {
    return (
      <div className="w-full flex-col gap-2 flex items-center justify-center h-[55vh]">
        <span className="text-muted-foreground text-lg font-medium">
          <Loader2 className="animate-spin" />
        </span>
      </div>
    );
  }

  const isEmptyState =
    !data ||
    data.length === 0 ||
    (data.length === 1 &&
      createRegexByResourceType(resourceType).test(data[0].name));

  if (isEmptyState) {
    return (
      <EmptyState resourceType={resourceType} customButton={customButton} />
    );
  }

  return (
    <div className="mt-6 grid gap-4 pb-20 w-full">
      <div className="flex flex-col gap-4 w-full overflow-auto">
        <div className="flex items-center justify-between">
          <Input
            placeholder={`Filter ${resourceType.toLowerCase()}s...`}
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="md:max-w-sm"
          />
          {customButton ? customButton : null}
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
