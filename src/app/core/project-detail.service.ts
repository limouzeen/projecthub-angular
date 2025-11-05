// -------------------------------------------------------------------
// ⚠️ MOCK-FIRST: ใช้ mock data เพื่อพัฒนา UI ก่อน
// TODO(WIRE_BACKEND): เมื่อเชื่อม ASP.NET Core จริง ให้ลบส่วน MOCK
// และปลดคอมเมนต์โค้ด real API ที่เตรียมไว้ด้านล่าง
// -------------------------------------------------------------------
import { Injectable, Optional, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  dataType: string;
  isPrimary: boolean;
  isNullable: boolean;
};

export type RowDto = {
  rowId: number;
  tableId: number;
  data: string;
  createdAt: string;
};

@Injectable({ providedIn: 'root' })
export class ProjectDetailService {
  private readonly base = '/api';
  constructor(@Optional() private http: HttpClient) {}

  // ========================= MOCK =========================
  private MOCK_PROJECT: ProjectDto = {
    projectId: 1001,
    name: 'Sales Analytics',
    createdAt: new Date().toISOString(),
    tables: 2,
  };

  private MOCK_TABLES: TableDto[] = [
    { tableId: 101, projectId: 1001, name: 'Products', createdAt: new Date().toISOString() },
    { tableId: 102, projectId: 1001, name: 'Orders',   createdAt: new Date().toISOString() },
  ];

  private MOCK_COLUMNS_BY_TABLE: Record<number, ColumnDto[]> = {
    101: [
      { columnId: 1, tableId: 101, name: 'ID',     dataType: 'int',    isPrimary: true,  isNullable: false },
      { columnId: 2, tableId: 101, name: 'Name',   dataType: 'text',   isPrimary: false, isNullable: false },
      { columnId: 3, tableId: 101, name: 'Price',  dataType: 'number', isPrimary: false, isNullable: false },
    ],
    102: [
      { columnId: 4, tableId: 102, name: 'ID',       dataType: 'int', isPrimary: true,  isNullable: false },
      { columnId: 5, tableId: 102, name: 'ProductId',dataType: 'int', isPrimary: false, isNullable: false },
      { columnId: 6, tableId: 102, name: 'Qty',      dataType: 'number', isPrimary: false, isNullable: false },
    ],
  };

  private MOCK_ROWS_BY_TABLE: Record<number, RowDto[]> = {
    101: [
      { rowId: 11, tableId: 101, data: JSON.stringify({ ID: 1, Name: 'Pen',  Price: 15 }), createdAt: new Date().toISOString() },
      { rowId: 12, tableId: 101, data: JSON.stringify({ ID: 2, Name: 'Book', Price: 80 }), createdAt: new Date().toISOString() },
    ],
    102: [
      { rowId: 21, tableId: 102, data: JSON.stringify({ ID: 9001, ProductId: 1, Qty: 2 }), createdAt: new Date().toISOString() },
    ],
  };
  // ========================================================

  // ให้หน้า ProjectDetail เรียกเพื่อแน่ใจว่ามีตารางเริ่มต้นสำหรับ project ที่เปิด
  ensureInitialMockTables(projectId: number) {
    const has = this.MOCK_TABLES.some(t => t.projectId === projectId);
    if (!has) {
      const t: TableDto = {
        tableId: Math.floor(Math.random() * 1e9),
        projectId,
        name: 'Sample Table',
        createdAt: new Date().toISOString(),
      };
      this.MOCK_TABLES.push(t);
    }
  }

  // --------------- PROJECTS ---------------
  getProject(projectId: number): Observable<ProjectDto> {
    // TODO: ใช้ API จริง
    // return this.http!.get<ProjectDto>(`${this.base}/projects/${projectId}`);
    return of(this.MOCK_PROJECT).pipe(delay(120));
  }

  // --------------- TABLES -----------------
  listTables(projectId: number): Observable<TableDto[]> {
    // TODO: ใช้ API จริง
    // return this.http!.get<TableDto[]>(`${this.base}/projects/${projectId}/tables`);
    const data = this.MOCK_TABLES.filter(t => t.projectId === projectId);
    return of(data).pipe(delay(120));
  }

  /** ✅ สร้างตาราง + ส่ง opts (mock-first) */
  createTable(
    projectId: number,
    name: string,
    opts: { useAutoIncrement: boolean; isPrimaryKey: boolean }
  ): Observable<TableDto> {
    // ---- API จริง (ลบ MOCK เมื่อเชื่อม) ----
    /*
    return this.http!.post<TableDto>(`${this.base}/tables`, {
      projectId,
      name,
      useAutoIncrement: opts.useAutoIncrement, // ✅ ตรงกับ CreateTableRequest
      isPrimaryKey: opts.isPrimaryKey
    });
    */

    // ---- MOCK ----
    const dto: TableDto = {
      tableId: Math.floor(Math.random() * 1e9),
      projectId,
      name,
      createdAt: new Date().toISOString(),
    };
    this.MOCK_TABLES = [dto, ...this.MOCK_TABLES];

    // จำลองการ “แถม” PK column ถ้าเลือก auto-increment
    if (opts.useAutoIncrement) {
      const cols = this.MOCK_COLUMNS_BY_TABLE[dto.tableId] ?? [];
      this.MOCK_COLUMNS_BY_TABLE[dto.tableId] = [
        { columnId: Math.floor(Math.random() * 1e9), tableId: dto.tableId, name: 'ID', dataType: 'int', isPrimary: true, isNullable: false },
        ...cols,
      ];
    }

    return of(dto).pipe(delay(150));
  }

  renameTable(tableId: number, name: string): Observable<TableDto> {
    // TODO: ใช้ API จริง
    // return this.http!.put<TableDto>(`${this.base}/tables/${tableId}`, { name });
    const idx = this.MOCK_TABLES.findIndex(t => t.tableId === tableId);
    if (idx >= 0) this.MOCK_TABLES[idx] = { ...this.MOCK_TABLES[idx], name };
    return of(this.MOCK_TABLES[idx]).pipe(delay(120));
  }

  deleteTable(tableId: number): Observable<void> {
    // TODO: ใช้ API จริง
    // return this.http!.delete<void>(`${this.base}/tables/${tableId}`);
    this.MOCK_TABLES = this.MOCK_TABLES.filter(t => t.tableId !== tableId);
    delete this.MOCK_COLUMNS_BY_TABLE[tableId];
    delete this.MOCK_ROWS_BY_TABLE[tableId];
    return of(void 0).pipe(delay(120));
  }

  // --------------- COLUMNS/ROWS ----------
  listColumns(tableId: number): Observable<ColumnDto[]> {
    // TODO: ใช้ API จริง
    // return this.http!.get<ColumnDto[]>(`${this.base}/tables/${tableId}/columns`);
    return of(this.MOCK_COLUMNS_BY_TABLE[tableId] ?? []).pipe(delay(100));
  }

  listRows(tableId: number, top = 5): Observable<RowDto[]> {
    // TODO: ใช้ API จริง
    // return this.http!.get<RowDto[]>(`${this.base}/tables/${tableId}/rows`, { params: { take: top } as any });
    const rows = (this.MOCK_ROWS_BY_TABLE[tableId] ?? []).slice(0, top);
    return of(rows).pipe(delay(100));
  }
}
