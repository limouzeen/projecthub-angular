import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

// ===== DTOs =====
export type ProjectDto = {
  projectId: number;
  name: string;
  createdAt: string;
  tables: number;
};

export type TableDto = {
  tableId: number;
  projectId: number;
  name: string;
  createdAt: string;
};

export type ColumnDto = {
  columnId: number;
  tableId: number;
  name: string;
  dataType: string;   // TEXT | IMAGE | INTEGER | INT | REAL | NUMBER | BOOLEAN
  isPrimary: boolean;
  isNullable: boolean;
};

export type RowDto = {
  rowId: number;
  tableId: number;
  data: string;       // JSON string
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class ProjectDetailService {
  private readonly base = '/api';

  constructor(@Optional() private http: HttpClient) {}

  // ===================================================================
  // ================ MOCK DATA (ลบเมื่อผูก API จริง) ===================
  // ===================================================================
  private MOCK_PROJECT: ProjectDto = {
    projectId: 1,
    name: 'Sales Analytics',
    createdAt: new Date().toISOString(),
    tables: 2,
  };

  private MOCK_TABLES: TableDto[] = [
    { tableId: 101, projectId: 1, name: 'Products', createdAt: new Date().toISOString() },
    { tableId: 102, projectId: 1, name: 'Orders',   createdAt: new Date().toISOString() },
  ];

  private MOCK_COLUMNS_BY_TABLE: Record<number, ColumnDto[]> = {
    101: [
      { columnId: 1, tableId: 101, name: 'ProductId', dataType: 'INTEGER', isPrimary: true,  isNullable: false },
      { columnId: 2, tableId: 101, name: 'Name',      dataType: 'TEXT',    isPrimary: false, isNullable: false },
      { columnId: 3, tableId: 101, name: 'Price',     dataType: 'REAL',    isPrimary: false, isNullable: false },
    ],
    102: [
      { columnId: 4, tableId: 102, name: 'OrderId',   dataType: 'INTEGER', isPrimary: true,  isNullable: false },
      { columnId: 5, tableId: 102, name: 'ProductId', dataType: 'INTEGER', isPrimary: false, isNullable: false },
      { columnId: 6, tableId: 102, name: 'Qty',       dataType: 'REAL',    isPrimary: false, isNullable: false },
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
  // ===================================================================

  // ------------------------- PROJECTS -------------------------
  getProject(projectId: number): Observable<ProjectDto> {
    // API จริง:
    // return this.http!.get<ProjectDto>(`${this.base}/projects/${projectId}`);

    return of(this.MOCK_PROJECT).pipe(delay(150));
  }

  // -------------------------- TABLES --------------------------
  listTables(projectId: number): Observable<TableDto[]> {
    // API จริง (เลือกอย่างใดอย่างหนึ่ง):
    // return this.http!.get<TableDto[]>(`${this.base}/projects/${projectId}/tables`);
    // หรือ
    // return this.http!.get<TableDto[]>(`${this.base}/tables`, { params: { projectId } as any });

    const data = this.MOCK_TABLES.filter(t => t.projectId === projectId);
    return of(data).pipe(delay(150));
  }

  /** ✅ สร้างตารางใหม่: รับ 3 ค่าตามสเปคล่าสุด (ProjectId, Name, UseAutoIncrement) */
  createTable(projectId: number, name: string, useAutoIncrement: boolean): Observable<TableDto> {
    // API จริง (เมื่อเชื่อม):
    /*
    return this.http!.post<TableDto>(`${this.base}/tables`, {
      projectId,
      name,
      useAutoIncrement
    });
    */

    // MOCK: สร้าง table + (ถ้า useAutoIncrement) แถมคอลัมน์ ID (INTEGER, PK)
    const dto: TableDto = {
      tableId: Math.floor(Math.random() * 1e9),
      projectId,
      name,
      createdAt: new Date().toISOString(),
    };

    this.MOCK_TABLES = [dto, ...this.MOCK_TABLES];
    this.MOCK_COLUMNS_BY_TABLE[dto.tableId] = [];
    this.MOCK_ROWS_BY_TABLE[dto.tableId] = [];

    // ถ้าเลือก AutoIncrement → แถมคอลัมน์ ID ให้ทันที
    if (useAutoIncrement) {
      this.MOCK_COLUMNS_BY_TABLE[dto.tableId].unshift({
        columnId: Math.floor(Math.random() * 1e9),
        tableId: dto.tableId,
        name: 'ID',
        dataType: 'INTEGER',
        isPrimary: true,
        isNullable: false,
      });
    }

    // อัปเดต count ใน project mock
    this.MOCK_PROJECT = {
      ...this.MOCK_PROJECT,
      tables: this.MOCK_TABLES.filter(t => t.projectId === projectId).length,
    };

    return of(dto).pipe(delay(250));
  }

  renameTable(tableId: number, name: string): Observable<TableDto> {
    // API จริง:
    // return this.http!.put<TableDto>(`${this.base}/tables/${tableId}`, { name });

    const idx = this.MOCK_TABLES.findIndex(t => t.tableId === tableId);
    if (idx >= 0) this.MOCK_TABLES[idx] = { ...this.MOCK_TABLES[idx], name };
    const dto = this.MOCK_TABLES[idx];
    return of(dto).pipe(delay(150));
  }

  deleteTable(tableId: number): Observable<void> {
    // API จริง:
    // return this.http!.delete<void>(`${this.base}/tables/${tableId}`);

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

  // ------------------------- COLUMNS --------------------------
  listColumns(tableId: number): Observable<ColumnDto[]> {
    // API จริง:
    // return this.http!.get<ColumnDto[]>(`${this.base}/tables/${tableId}/columns`);

    return of(this.MOCK_COLUMNS_BY_TABLE[tableId] ?? []).pipe(delay(120));
  }

  // --------------------------- ROWS ---------------------------
  listRows(tableId: number, top = 5): Observable<RowDto[]> {
    // API จริง:
    // return this.http!.get<RowDto[]>(`${this.base}/tables/${tableId}/rows`, { params: { take: top } as any });

    const rows = (this.MOCK_ROWS_BY_TABLE[tableId] ?? []).slice(0, top);
    return of(rows).pipe(delay(120));
  }
}
