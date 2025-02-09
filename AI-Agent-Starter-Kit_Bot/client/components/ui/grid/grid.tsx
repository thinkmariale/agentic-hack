import React from "react";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import styles from "./grid.module.css";

export interface TableColumn {
    title: string;
    id: string;
    type?: "string" | "number" | "boolean" | "date";
    width?: number;
    customRenderer?: React.FC<any>;
}

export interface TableRowData {
    [key: string]: string | number;
}

interface TableProps {
    columns: TableColumn[];
    data: TableRowData[];
    withFiltering?: boolean;
    title?: string;
    height?: string | number;
    getRowStyle?: (params: any) => any;
    rowHeight?: number;
}

export const DataTable: React.FC<TableProps> = ({
    columns,
    data,
    title,
    height = 500,
    rowHeight = 52,
}) => {

    const columnDefs: GridColDef[] = columns.map((col) => ({
        field: col.id,
        headerName: col.title,
        width: col.width || 110,
        renderCell: col.customRenderer
            ? (params) => col.customRenderer?.(params)
            : undefined,
        filterable: !!col.type, 
    }));

    const rowData = data?.map((row, index) => ({
        id: row.id ?? index,
        ...row,
    }));

    return (
        <div className={styles.gridContainer}>
            {!!title && (
                <span style={{ fontWeight: 600, fontSize: 26 }}>{title}</span>
            )}
            <div style={{ 
                height: typeof height === "number" ? `${height}px` : height, 
                width: "100%", 
                flex: 1, 
                background: "#fff", 
                borderRadius: "15px",
                overflow: "hidden",
                }}
            >
                <DataGrid
                    className="custom-data-grid"
                    rows={rowData}
                    columns={columnDefs}
                    pageSizeOptions={[5, 10, 20]}
                    rowHeight={rowHeight}
                    sx={{
                        "& .MuiDataGrid-row--borderBottom": {
                            background: "#f0f0f0 !important",
                        },
                        "& .MuiDataGrid-columnHeaderTitle": {
                            fontWeight: "bold",
                        },
                    }}
                    disableRowSelectionOnClick
                />
            </div>
        </div>
    );
};
