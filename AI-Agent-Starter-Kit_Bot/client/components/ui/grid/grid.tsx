import React from "react";
import { AgGridReact } from 'ag-grid-react';
import {
    ColDef,
    ColGroupDef,
    ValueFormatterParams
} from "@ag-grid-community/core";
import './Table.scss';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import styles from './grid.module.css'


export interface TableColumn {
    title: string;
    id: string;
    type?: "string" | "number" | "boolean" | "date",
    width?: number;
    customRenderer?: React.FC<any>,
    valueFormatter?: (params: ValueFormatterParams) => string | null;
}

export interface TableRowData {
    [key: string]: string | number;
}

interface TableProps {
    columns: TableColumn[];
    data: any[];
    withFiltering?: boolean;
    title?: string;
    height?: string | number;
    getRowStyle?: (params: any) => any;
    rowHeight?: number;
}

export const DataTable: React.FC<TableProps> = ({ columns, data, getRowStyle, height, rowHeight, title, withFiltering }) => {

    const columnDefs: ColDef[] | ColGroupDef[] = columns.map(x => ({
        field: x.id,
        headerName: x.title,
        filter: withFiltering ? (x.type === "number" ? "agNumberColumnFilter" : "agTextColumnFilter") : false,
        minWidth: x.width,
        floatingFilter: withFiltering && x.type === "number" ? true : false,
        cellRenderer: x.customRenderer,
        valueFormatter: x.valueFormatter
    })) as ColDef[]

    return (
        <div className={styles.gridContainer}>
            {!!title && <span style={{
                fontWeight: 600,
                fontSize: 26,
            }}>{title}</span>}
            <div className="ag-theme-quartz" style={{ height: height ?? 500 }}>
                <AgGridReact rowData={data} columnDefs={columnDefs as any} rowHeight={rowHeight} defaultColDef={{ flex: 1 }} getRowStyle={getRowStyle} suppressRowClickSelection suppressMovableColumns />
            </div>
        </div>
    )
}