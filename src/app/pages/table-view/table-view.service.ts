// src/app/pages/table-view/table-view.service.ts
// ================================================================
// ⚠️ MOCK DATA REGION — ลบส่วนนี้เมื่อเชื่อมกับ ASP.NET Core API จริง
// ================================================================

import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export type ColumnDto = {
  columnId: number;
  tableId: number;
  name: string;
  dataType: string;     // "TEXT" | "STRING" | "IMAGE" | "INTEGER" | "REAL" | "BOOLEAN" | "LOOKUP" | "FORMULA"
  isPrimary: boolean;
  isNullable: boolean;
};

export type RowDto = {
  rowId: number;
  tableId: number;
  data: string;         // JSON string
  createdAt: string;
};

// แบบฟอร์มที่ FieldDialog ส่งกลับ
export type FieldDialogModel = {
  name: string;
  dataType: 'TEXT'|'STRING'|'IMAGE'|'INTEGER'|'REAL'|'BOOLEAN'|'LOOKUP'|'FORMULA';
  isNullable: boolean;
  isPrimary: boolean;

  // lookup (ส่งก็ต่อเมื่อเป็น Lookup)
  targetTableId: number|null;
  targetColumnId: number|null;

  // formula (ส่งเมื่อเป็น Formula)
  formulaDefinition: string|null;
};

// ✅ เพิ่ม type แบบย่อที่ FieldDialog ใช้
export type TableListItem  = { tableId: number; name: string };
export type ColumnListItem = { columnId: number; name: string };

@Injectable({ providedIn: 'root' })
export class TableViewService {
  // private readonly base = '/api';
  // constructor(@Optional() private http: HttpClient) {}

  // ---------- MOCK STORAGE ----------
  // ✅ ตารางแบบย่อสำหรับ List
  private MOCK_TABLES: TableListItem[] = [
    { tableId: 101, name: 'Products' },
    { tableId: 102, name: 'Orders'   },
  ];

  private MOCK_COLUMNS: Record<number, ColumnDto[]> = {
    101: [
      { columnId: 1, tableId: 101, name: 'ProductId', dataType: 'INTEGER', isPrimary: true,  isNullable: false },
      { columnId: 2, tableId: 101, name: 'Name',      dataType: 'TEXT',    isPrimary: false, isNullable: false },
      { columnId: 3, tableId: 101, name: 'Image',     dataType: 'IMAGE',   isPrimary: false, isNullable: true  },
      { columnId: 4, tableId: 101, name: 'Price',     dataType: 'REAL',    isPrimary: false, isNullable: false },
    ],
    102: [
      { columnId: 5, tableId: 102, name: 'OrderId',   dataType: 'INTEGER', isPrimary: true,  isNullable: false },
      { columnId: 6, tableId: 102, name: 'ProductId', dataType: 'INTEGER', isPrimary: false, isNullable: false },
      { columnId: 7, tableId: 102, name: 'Qty',       dataType: 'REAL',    isPrimary: false, isNullable: false },
    ],
  };

  private MOCK_ROWS: Record<number, RowDto[]> = {
    101: [
      { rowId: 11, tableId: 101, data: JSON.stringify({ ProductId: 1, Name: 'Pen',  Image: '', Price: 10 }), createdAt: new Date().toISOString() },
      { rowId: 12, tableId: 101, data: JSON.stringify({ ProductId: 2, Name: 'Book', Image: '', Price: 50 }), createdAt: new Date().toISOString() },
    ],
    102: [
      { rowId: 21, tableId: 102, data: JSON.stringify({ OrderId: 9001, ProductId: 1, Qty: 2 }), createdAt: new Date().toISOString() },
    ],
  };
  // ----------------------------------

  // 🔹 Lists for dialogs (NEW)
  /** ✅ รายการตารางแบบย่อ (สำหรับ dropdown) */
  listTables(): Observable<TableListItem[]> {
    // REAL: return this.http!.get<TableListItem[]>(`${this.base}/projects/{id}/tables-lite`);
    return of(this.MOCK_TABLES).pipe(delay(100));
  }

  /** ✅ รายการคอลัมน์แบบย่อของตาราง (สำหรับเลือกเป้า Lookup/PK) */
  listColumnsLite(tableId: number): Observable<ColumnListItem[]> {
    // REAL: return this.http!.get<ColumnListItem[]>(`${this.base}/tables/${tableId}/columns-lite`);
    const items = (this.MOCK_COLUMNS[tableId] ?? []).map(c => ({ columnId: c.columnId, name: c.name }));
    return of(items).pipe(delay(100));
  }

  // 🔹 Columns API
  listColumns(tableId: number): Observable<ColumnDto[]> {
    // REAL: return this.http!.get<ColumnDto[]>(`${this.base}/tables/${tableId}/columns`);
    return of(this.MOCK_COLUMNS[tableId] ?? []).pipe(delay(100));
  }

  createColumn(tableId: number, dto: Partial<ColumnDto>): Observable<ColumnDto> {
    // REAL: return this.http!.post<ColumnDto>(`${this.base}/columns`, { ...dto, tableId });
    const col: ColumnDto = {
      columnId: Math.floor(Math.random() * 1e6),
      tableId,
      name: dto.name ?? 'NewField',
      dataType: (dto.dataType ?? 'TEXT').toUpperCase(),
      isPrimary: dto.isPrimary ?? false,
      isNullable: dto.isNullable ?? true,
    };
    this.MOCK_COLUMNS[tableId] = [...(this.MOCK_COLUMNS[tableId] ?? []), col];
    return of(col).pipe(delay(150));
  }

  updateColumn(columnId: number, patch: Partial<ColumnDto>): Observable<ColumnDto> {
    // REAL: return this.http!.put<ColumnDto>(`${this.base}/columns/${columnId}`, patch);
    for (const tableId in this.MOCK_COLUMNS) {
      const cols = this.MOCK_COLUMNS[tableId];
      const i = cols.findIndex(c => c.columnId === columnId);
      if (i >= 0) {
        cols[i] = { ...cols[i], ...patch };
        return of(cols[i]).pipe(delay(120));
      }
    }
    return of(null as any).pipe(delay(120));
  }

  deleteColumn(columnId: number): Observable<void> {
    // REAL: return this.http!.delete<void>(`${this.base}/columns/${columnId}`);
    for (const tableId in this.MOCK_COLUMNS) {
      this.MOCK_COLUMNS[tableId] = this.MOCK_COLUMNS[tableId].filter(c => c.columnId !== columnId);
    }
    return of(void 0).pipe(delay(150));
  }

  // 🔹 Rows API
  listRows(tableId: number): Observable<RowDto[]> {
    // REAL: return this.http!.get<RowDto[]>(`${this.base}/tables/${tableId}/rows`);
    return of(this.MOCK_ROWS[tableId] ?? []).pipe(delay(150));
  }

  createRow(tableId: number, data: Record<string, any>): Observable<RowDto> {
    // REAL: return this.http!.post<RowDto>(`${this.base}/rows`, { tableId, data });
    const row: RowDto = {
      rowId: Math.floor(Math.random() * 1e6),
      tableId,
      data: JSON.stringify(data),
      createdAt: new Date().toISOString(),
    };
    this.MOCK_ROWS[tableId] = [...(this.MOCK_ROWS[tableId] ?? []), row];
    return of(row).pipe(delay(150));
  }

  updateRow(rowId: number, data: Record<string, any>): Observable<RowDto> {
    // REAL: return this.http!.put<RowDto>(`${this.base}/rows/${rowId}`, { data });
    for (const tableId in this.MOCK_ROWS) {
      const list = this.MOCK_ROWS[tableId];
      const idx = list.findIndex(r => r.rowId === rowId);
      if (idx >= 0) {
        list[idx] = { ...list[idx], data: JSON.stringify(data) };
        return of(list[idx]).pipe(delay(150));
      }
    }
    return of(null as any).pipe(delay(150));
  }

  deleteRow(rowId: number): Observable<void> {
    // REAL: return this.http!.delete<void>(`${this.base}/rows/${rowId}`);
    for (const tableId in this.MOCK_ROWS) {
      this.MOCK_ROWS[tableId] = this.MOCK_ROWS[tableId].filter(r => r.rowId !== rowId);
    }
    return of(void 0).pipe(delay(150));
  }

  // 🔹 Utils (สำหรับ UX)
  /** หาเลข run ถัดไปของคีย์หลัก (mock: หา max+1 ในแถวปัจจุบัน) */
  nextRunningId(tableId: number, pkName: string): Observable<number> {
    // REAL: GET `${this.base}/rows/next-id?tableId=${tableId}&pk=${pkName}`
    const rows = this.MOCK_ROWS[tableId] ?? [];
    let max = 0;
    for (const r of rows) {
      const obj = JSON.parse(r.data || '{}');
      const v = Number(obj[pkName]);
      if (!Number.isNaN(v)) max = Math.max(max, v);
    }
    return of(max + 1).pipe(delay(80));
  }

  /** อัปโหลดรูป (mock: สร้าง URL จำลอง) แล้วส่งคืน path/url */


/** อัปโหลดรูป (mock: สร้าง URL จำลอง) แล้วส่งคืน path/url */
uploadImage(
  file: File,
  meta?: { tableId?: number; rowId?: number; columnId?: number }
): Promise<string> {
  return new Promise((resolve) => {
    // แปลงไฟล์เป็น base64 (Data URL) เพื่อพรีวิวและ mock URL ได้ทันที
    const reader = new FileReader();
    reader.onload = () => {
      const fakeUrl = reader.result as string;
      console.log('📸 MOCK upload complete:', {
        name: file.name,
        size: file.size,
        table: meta?.tableId,
        row: meta?.rowId,
        column: meta?.columnId,
      });
      // หน่วงเวลาเล็กน้อยให้เหมือนกำลัง upload จริง
      setTimeout(() => resolve(fakeUrl), 800);
    };
    reader.readAsDataURL(file);
  });
}

  
}
