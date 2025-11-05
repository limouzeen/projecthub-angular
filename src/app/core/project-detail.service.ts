import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// ===== DTOs =====
export type ProjectDto = { projectId: number; name: string; createdAt: string; tables: number; };
export type TableDto   = { tableId: number; projectId: number; name: string; createdAt: string; };
export type ColumnDto  = { columnId: number; tableId: number; name: string; dataType: string; isPrimary: boolean; isNullable: boolean; };
export type RowDto     = { rowId: number; tableId: number; data: string; createdAt: string; };

@Injectable({ providedIn: 'root' })
export class ProjectDetailService {
  private readonly base = '/api';
  constructor(@Optional() private http: HttpClient) {}

  // ==== MOCKS (ลบเมื่อเชื่อมจริง) ====
  private MOCK_PROJECT: ProjectDto = { projectId: 1, name: 'Sales Analytics', createdAt: new Date().toISOString(), tables: 2 };
  private MOCK_TABLES: TableDto[] = [
    { tableId: 101, projectId: 1, name: 'Products', createdAt: new Date().toISOString() },
    { tableId: 102, projectId: 1, name: 'Orders',   createdAt: new Date().toISOString() },
  ];
  private MOCK_COLUMNS_BY_TABLE: Record<number, ColumnDto[]> = {
    101: [
      { columnId: 1, tableId: 101, name: 'ProductId', dataType: 'int',    isPrimary: true,  isNullable: false },
      { columnId: 2, tableId: 101, name: 'Name',      dataType: 'text',   isPrimary: false, isNullable: false },
      { columnId: 3, tableId: 101, name: 'Price',     dataType: 'number', isPrimary: false, isNullable: false },
    ],
    102: [
      { columnId: 4, tableId: 102, name: 'OrderId',   dataType: 'int',    isPrimary: true,  isNullable: false },
      { columnId: 5, tableId: 102, name: 'ProductId', dataType: 'int',    isPrimary: false, isNullable: false },
      { columnId: 6, tableId: 102, name: 'Qty',       dataType: 'number', isPrimary: false, isNullable: false },
    ],
  };
  private MOCK_ROWS_BY_TABLE: Record<number, RowDto[]> = {
    101: [
      { rowId: 11, tableId: 101, data: JSON.stringify({ ProductId: 1, Name: 'Pen',  Price: 15 }), createdAt: new Date().toISOString() },
      { rowId: 12, tableId: 101, data: JSON.stringify({ ProductId: 2, Name: 'Book', Price: 80 }), createdAt: new Date().toISOString() },
    ],
    102: [
      { rowId: 21, tableId: 102, data: JSON.stringify({ OrderId: 9001, ProductId: 1, Qty: 2 }), createdAt: new Date().toISOString() },
    ],
  };
  // ================================

  getProject(projectId: number): Observable<ProjectDto> {
    return of(this.MOCK_PROJECT).pipe(delay(150));
  }

  listTables(projectId: number): Observable<TableDto[]> {
    const data = this.MOCK_TABLES.filter(t => t.projectId === projectId);
    return of(data).pipe(delay(150));
  }

  /** ✅ ใช้ 3 ค่าเท่านั้น */
  createTable(projectId: number, name: string, useAutoIncrement: boolean): Observable<TableDto> {
    // --- API จริง (ปลดคอมเมนต์เมื่อเชื่อม) ---
    /*
    return this.http!.post<TableDto>(`${this.base}/tables`, {
      projectId,
      name,
      useAutoIncrement
    });
    */

    // --- MOCK ---
    const table: TableDto = {
      tableId: Math.floor(Math.random() * 1e9),
      projectId,
      name,
      createdAt: new Date().toISOString(),
    };
    this.MOCK_TABLES = [table, ...this.MOCK_TABLES];

    // เตรียม columns / rows
    this.MOCK_COLUMNS_BY_TABLE[table.tableId] = [];
    this.MOCK_ROWS_BY_TABLE[table.tableId] = [];

    // ถ้าเปิด auto-increment: สร้างคอลัมน์แรกเป็น PK ID
    if (useAutoIncrement) {
      this.MOCK_COLUMNS_BY_TABLE[table.tableId].push({
        columnId: Math.floor(Math.random() * 1e9),
        tableId: table.tableId,
        name: 'ID',
        dataType: 'int',
        isPrimary: true,
        isNullable: false,
      });
    }

    // update count
    this.MOCK_PROJECT = {
      ...this.MOCK_PROJECT,
      tables: this.MOCK_TABLES.filter(t => t.projectId === projectId).length,
    };

    return of(table).pipe(delay(200));
  }

  renameTable(tableId: number, name: string): Observable<TableDto> { /* เหมือนเดิม */ 
    const idx = this.MOCK_TABLES.findIndex(t => t.tableId === tableId);
    if (idx >= 0) this.MOCK_TABLES[idx] = { ...this.MOCK_TABLES[idx], name };
    return of(this.MOCK_TABLES[idx]).pipe(delay(150));
  }

  deleteTable(tableId: number): Observable<void> { /* เหมือนเดิม */
    const tab = this.MOCK_TABLES.find(t => t.tableId === tableId);
    this.MOCK_TABLES = this.MOCK_TABLES.filter(t => t.tableId !== tableId);
    delete this.MOCK_COLUMNS_BY_TABLE[tableId];
    delete this.MOCK_ROWS_BY_TABLE[tableId];
    if (tab) {
      this.MOCK_PROJECT = {
        ...this.MOCK_PROJECT,
        tables: this.MOCK_TABLES.filter(t => t.projectId === tab.projectId).length,
      };
    }
    return of(void 0).pipe(delay(150));
  }

  listColumns(tableId: number): Observable<ColumnDto[]> {
    return of(this.MOCK_COLUMNS_BY_TABLE[tableId] ?? []).pipe(delay(120));
  }

  listRows(tableId: number, top = 5): Observable<RowDto[]> {
    const rows = (this.MOCK_ROWS_BY_TABLE[tableId] ?? []).slice(0, top);
    return of(rows).pipe(delay(120));
  }
}
