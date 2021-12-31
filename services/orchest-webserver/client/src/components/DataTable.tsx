import { useAsync } from "@/hooks/useAsync";
import { useDebounce } from "@/hooks/useDebounce";
import { useMounted } from "@/hooks/useMounted";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import Box, { BoxProps } from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Collapse from "@mui/material/Collapse";
import InputBase from "@mui/material/InputBase";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import { alpha, styled, SxProps, Theme } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { fetcher } from "@orchest/lib-utils";
import React from "react";
import { IconButton } from "./common/IconButton";

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.spacing(1),
  border: `1px solid ${alpha(theme.palette.grey[300], 0.8)}`,
  backgroundColor: alpha(theme.palette.grey[100], 0.2),
  "&:hover": {
    backgroundColor: alpha(theme.palette.grey[100], 0.6),
  },
  margin: theme.spacing(2, 0),
  width: "100%",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 1, 0, 2),
  color: theme.palette.grey[400],
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

type Order = "asc" | "desc";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

const LoadingRows: React.FC<{
  selectable: boolean;
  columnLength: number;
  rows: number;
}> = ({ selectable, columnLength, rows = 5 }) => {
  return (
    <>
      {[...Array(rows).keys()].map((rowKey) => {
        return (
          <TableRow sx={{ height: (theme) => theme.spacing(9) }} key={rowKey}>
            {selectable && (
              <TableCell key="checkbox">
                <Skeleton variant="text" />
              </TableCell>
            )}
            {[...Array(columnLength).keys()].map((key) => {
              return (
                <TableCell key={key}>
                  <Skeleton variant="text" />
                </TableCell>
              );
            })}
          </TableRow>
        );
      })}
    </>
  );
};

export type DataTableColumn<T> = {
  disablePadding?: boolean;
  id: keyof T;
  label: string;
  numeric?: boolean;
  sortable?: boolean;
  align?: "inherit" | "left" | "center" | "right" | "justify";
  sx?: SxProps<Theme>;
  render?: (row: T & { uuid: string }) => React.ReactNode;
};

export type DataTableRow<T> = T & {
  uuid: string;
  // in case you're rendering something totally different from the data
  // provide a searchIndex for matching user's search term
  searchIndex?: string;
  details?: React.ReactNode;
};

type EnhancedTableProps<T> = {
  tableId: string;
  numSelected: number;
  onRequestSort: (event: React.MouseEvent<unknown>, property: keyof T) => void;
  onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
  order: Order;
  orderBy: keyof T | "";
  rowCount: number;
  data: DataTableColumn<T>[];
  selectable: boolean;
};

function EnhancedTableHead<T>(props: EnhancedTableProps<T>) {
  const {
    tableId,
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    selectable,
    data,
  } = props;
  const createSortHandler = (property: keyof T) => (
    event: React.MouseEvent<unknown>
  ) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={onSelectAllClick}
              inputProps={{ "aria-label": "select all desserts" }}
              data-test-id={`${tableId}-toggle-all-rows`}
            />
          </TableCell>
        )}
        {data.map((headCell, index) => (
          <TableCell
            key={headCell.id.toString()}
            align={index === 0 ? "left" : headCell.align || "center"}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
            sx={headCell.sx}
          >
            {headCell.sortable ? (
              <TableSortLabel
                active={orderBy === headCell.id}
                direction={orderBy === headCell.id ? order : "asc"}
                onClick={createSortHandler(headCell.id)}
              >
                {headCell.label}
                {orderBy === headCell.id ? (
                  <Box component="span" sx={visuallyHidden}>
                    {order === "desc"
                      ? "sorted descending"
                      : "sorted ascending"}
                  </Box>
                ) : null}
              </TableSortLabel>
            ) : (
              headCell.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

export function renderCell<T>(
  column: DataTableColumn<T>,
  row: DataTableRow<T>
) {
  return column.render ? column.render(row) : row[column.id];
}

function Row<T>({
  tableId,
  columns,
  data,
  isSelected,
  selectable,
  onRowClick,
  onClickCheckbox,
}: {
  tableId: string;
  columns: DataTableColumn<T>[];
  data: DataTableRow<T>;

  onClickCheckbox: (
    e: React.MouseEvent<HTMLButtonElement>,
    uuid: string
  ) => void;
  isSelected: boolean;
  selectable: boolean;
  onRowClick?: (e: React.MouseEvent<unknown>, uuid: string) => void;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const handleClickRow = (e: React.MouseEvent<unknown>) => {
    setIsOpen((current) => !current);
    onRowClick(e, data.uuid);
  };

  const labelId = `checkbox-${data.uuid}`;

  return (
    <>
      <TableRow
        hover
        onClick={(e) => handleClickRow(e)}
        role="checkbox"
        aria-checked={isSelected}
        tabIndex={-1}
        key={data.uuid}
        selected={isSelected}
        sx={{
          ...(data.details
            ? { "& > *": { borderBottom: "unset !important" } }
            : null),
          ...(selectable || onRowClick ? { cursor: "pointer" } : null),
        }}
        data-test-id={`${tableId}-row`}
      >
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              color="primary"
              checked={isSelected}
              onClick={(e) => onClickCheckbox(e, data.uuid)}
              inputProps={{ "aria-labelledby": labelId }}
              data-test-id={`${tableId}-row-checkbox`}
            />
          </TableCell>
        )}
        <TableCell
          component="th"
          align="left"
          id={labelId}
          scope="row"
          sx={columns[0].sx}
        >
          {renderCell(columns[0], data)}
        </TableCell>
        {columns.slice(1).map((column) => {
          return (
            <TableCell
              key={column.id.toString()}
              align={column.align || "center"}
              sx={column.sx}
            >
              {column.sortable ? (
                <Box sx={{ marginRight: (theme) => theme.spacing(2.75) }}>
                  {renderCell(column, data)}
                </Box>
              ) : (
                renderCell(column, data)
              )}
            </TableCell>
          );
        })}
      </TableRow>
      {data.details && (
        <TableRow>
          <TableCell
            style={{ paddingBottom: 0, paddingTop: 0 }}
            colSpan={selectable ? columns.length + 1 : columns.length}
          >
            <Collapse in={isOpen} timeout="auto" unmountOnExit>
              {data.details}
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  baseUrl?: string;
  generateDataUrl?: ({
    baseUrl,
    page,
    rowsPerPage,
  }: {
    baseUrl: string;
    page?: number;
    rowsPerPage?: number;
    searchTerm?: string;
  }) => string;
  rows: DataTableRow<T>[];
  id: string;
  initialSelectedRows?: string[];
  selectedRows?: string[];
  setSelectedRows?: (
    action: string[] | ((current: string[]) => string[])
  ) => void;
  onChangeSelection?: (rowUuids: string[]) => void;
  selectable?: boolean;
  initialOrderBy?: keyof T;
  initialOrder?: Order;
  deleteSelectedRows?: (rowUuids: string[]) => Promise<boolean>;
  onRowClick?: (uuid: string) => void;
  rowHeight?: number;
  debounceTime?: number;
  hideSearch?: boolean;
  isLoading?: boolean;
} & BoxProps;

function useDataFetcher<T>(dataUrl: string) {
  const { run, status, error, data } = useAsync<DataTableRow<T>[]>();

  React.useEffect(() => {
    if (dataUrl) run(fetcher(dataUrl));
  }, [dataUrl]);
  return { data, status, error };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const DataTable = <T extends Record<string, any>>({
  id,
  columns,
  rows: originalRowsFromProp,
  initialOrderBy,
  initialOrder,
  deleteSelectedRows,
  onRowClick,
  selectable = false,
  rowHeight = 57,
  debounceTime = 250,
  hideSearch,
  initialSelectedRows = [],
  selectedRows,
  setSelectedRows,
  onChangeSelection,
  baseUrl,
  generateDataUrl = ({ baseUrl }) => baseUrl,
  isLoading,
  ...props
}: DataTableProps<T>) => {
  const mounted = useMounted();
  const [searchTerm, setSearchTerm] = React.useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, debounceTime);
  const [order, setOrder] = React.useState<Order>(initialOrder || "asc");
  const [orderBy, setOrderBy] = React.useState<keyof T | "">(
    initialOrderBy || ""
  );

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState<number>(10);

  const dataUrl = generateDataUrl({
    baseUrl,
    page,
    rowsPerPage,
    searchTerm: debouncedSearchTerm,
  });
  const { status, error, data } = useDataFetcher<T>(dataUrl);
  const isFetchingData = isLoading || status === "PENDING";

  const [localSelected, setLocalSelected] = React.useState<string[]>(
    initialSelectedRows
  );

  const selected = selectedRows || localSelected;
  const setSelected = React.useCallback(
    (action: string[] | ((current: string[]) => string[])) => {
      const dispatcher = setSelectedRows || setLocalSelected;
      dispatcher((current) => {
        const value = action instanceof Function ? action(current) : action;
        if (onChangeSelection && mounted) onChangeSelection(value);
        return value;
      });
    },
    [mounted, setSelectedRows, onChangeSelection]
  );

  const sortedRows = React.useMemo(() => {
    const originalRows = originalRowsFromProp || data || [];

    if (!orderBy) return originalRows;
    return originalRows.sort(getComparator(order, orderBy));
  }, [order, orderBy, originalRowsFromProp, data]);

  // search is more expensive, should put later than sort
  const rows = React.useMemo(() => {
    return !debouncedSearchTerm
      ? sortedRows
      : sortedRows.filter((unfilteredRow) => {
          return columns.some((column) => {
            const value = `${unfilteredRow[column.id]}${
              unfilteredRow.searchIndex || ""
            }`;
            return value
              .toLowerCase()
              .includes(debouncedSearchTerm.toLowerCase());
          });
        });
  }, [sortedRows, debouncedSearchTerm, columns]);

  const rowsInPage = React.useMemo(() => {
    return rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [rows, page, rowsPerPage]);

  React.useEffect(() => {
    if (mounted) {
      setSelected((currentSelected) => {
        return currentSelected.filter((selectedRowUuid) =>
          rows.some((row) => row.uuid === selectedRowUuid)
        );
      });
    }
    // we only want to filter selected when row is updated
  }, [rows]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: keyof T
  ) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    // we only allow select all entries in the same page
    // and when user change page, the selection will be cleaned up.
    setSelected((current) => {
      if (current.length < rowsInPage.length) {
        const newSelectedRows = rowsInPage.map((n) => n.uuid);
        return newSelectedRows;
      }
      const selectedAllItemsInPage =
        event.target.checked && event.target.dataset.indeterminate;

      if (selectedAllItemsInPage && current.length === rowsInPage.length) {
        return [];
      }
      return [];
    });
  };

  const handleClickCheckbox = (e: React.MouseEvent<unknown>, uuid: string) => {
    if (!selectable) return;
    // prevent firing handleClickRow
    e.stopPropagation();

    setSelected((currentValue) => {
      const isChecked = (e.target as HTMLInputElement).checked;
      return isChecked
        ? [...currentValue, uuid]
        : currentValue.filter((checkedUuid) => checkedUuid !== uuid);
    });
  };

  const handleClickRow = (e: React.MouseEvent<unknown>, uuid: string) => {
    if (onRowClick) {
      e.preventDefault();
      onRowClick(uuid);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setSelected([]);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDeleteSelectedRows = async () => {
    if (deleteSelectedRows) {
      const success = await deleteSelectedRows(selected);
      if (success) setSelected([]);
    }
  };

  const isSelected = (uuid: string) => selected.indexOf(uuid) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  const tableTitleId = `${id}-title`;

  return (
    <Box sx={{ width: "100%" }} {...props}>
      {!hideSearch && (
        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search"
            inputProps={{ "aria-label": "search" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Search>
      )}
      <Paper sx={{ width: "100%", mb: 2 }}>
        <TableContainer>
          <Table
            sx={{ minWidth: 750 }}
            aria-labelledby={tableTitleId}
            size="medium"
            id={id}
            data-test-id={id}
          >
            <EnhancedTableHead
              tableId={id}
              selectable={selectable}
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
              data={columns}
            />
            <TableBody>
              {isFetchingData && (
                <LoadingRows
                  selectable={selectable}
                  columnLength={columns.length}
                />
              )}
              {rowsInPage.map((row: DataTableRow<T>) => {
                const isItemSelected = isSelected(row.uuid);

                return (
                  <Row<T>
                    tableId={id}
                    data={row}
                    columns={columns}
                    isSelected={isItemSelected}
                    onRowClick={handleClickRow}
                    onClickCheckbox={handleClickCheckbox}
                    selectable={selectable}
                    key={row.uuid}
                  />
                );
              })}
              {emptyRows > 0 && (
                <TableRow style={{ height: rowHeight * emptyRows }}>
                  <TableCell
                    colSpan={selectable ? columns.length + 1 : columns.length}
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack direction="row">
          {selected.length > 0 && (
            <Stack direction="row" alignItems="center">
              <Typography
                color={selected.length > 0 ? "inherit" : "initial"}
                variant="subtitle1"
                component="div"
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  marginLeft: (theme) => theme.spacing(2.5),
                  marginRight: (theme) => theme.spacing(2),
                }}
              >
                {selected.length > 0 ? `${selected.length} selected` : ""}
              </Typography>
              {deleteSelectedRows && (
                <IconButton
                  title="Delete"
                  data-test-id={`${id}-delete`}
                  onClick={handleDeleteSelectedRows}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Stack>
          )}
          <TablePagination
            sx={{ flex: 1 }}
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={rows.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            data-test-id={`${id}-pagination`}
          />
        </Stack>
      </Paper>
    </Box>
  );
};
