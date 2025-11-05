import { Injectable, Optional } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

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
  data: string;   // JSON string
  createdAt: string;
};

export type FieldDialogModel = {
  name: string;
  dataType: 'TEXT'|'STRING'|'IMAGE'|'INTEGER'|'REAL'|'BOOLEAN'|'LOOKUP'|'FORMULA';
  isNullable: boolean;
  isPrimary: boolean;
  targetTableId: number|null;
  targetColumnId: number|null;
  formulaDefinition: string|null;
};

export type TableListItem  = { tableId: number; name: string };
export type ColumnListItem = { columnId: number; name: string };

@Injectable({ providedIn: 'root' })
export class TableViewService {
  // private readonly base = '/api';
  // constructor(@Optional() private http: HttpClient) {}

  // ---------------- MOCK ----------------
  /** ตารางตัวอย่าง: Products/Orders (ถือว่าไม่ได้สร้างแบบ auto-increment) */
  private MOCK_TABLES: TableListItem[] = [
    { tableId: 101, name: 'Products' },
    { tableId: 102, name: 'Orders'   },
  ];

  /** คอลัมน์ของตารางตัวอย่าง
   *  - Products ใช้ ProductId เป็น PK (ไม่ได้ใช้ชื่อ ID เพื่อโชว์เคส “ไม่เลือก auto-increment”)
   *  - Orders ใช้ OrderId เป็น PK
   *  ตารางใหม่ที่สร้างด้วย useAutoIncrement=true จะมีคอลัมน์ชื่อ "ID" เป็น PK เสมอ
   */
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
  // --------------------------------------

  // --------------------------------------
  // Helpers
  // --------------------------------------
  private newId(max = 1e9) { return Math.floor(Math.random() * max); }

  private getPrimaryKeyCol(tableId: number): ColumnDto | undefined {
    return (this.MOCK_COLUMNS[tableId] ?? []).find(c => c.isPrimary);
  }

  private ensureSinglePrimaryKey(tableId: number, keepColumnId: number) {
    const cols = this.MOCK_COLUMNS[tableId] ?? [];
    this.MOCK_COLUMNS[tableId] = cols.map(c => ({
      ...c,
      isPrimary: c.columnId === keepColumnId
    }));
  }

  // --------------------------------------
  // Tables
  // --------------------------------------
  listTables(): Observable<TableListItem[]> {
    return of(this.MOCK_TABLES).pipe(delay(100));
  }

  /** ✅ สร้างตารางใหม่ (mock): ถ้า useAutoIncrement → แถมคอลัมน์ ID (INTEGER, PK, not null) */
  createTable(name: string, useAutoIncrement: boolean): Observable<TableListItem> {
    const tableId = this.newId();
    const table: TableListItem = { tableId, name: name?.trim() || 'NewTable' };

    // เพิ่มเข้า registry
    this.MOCK_TABLES = [table, ...this.MOCK_TABLES];

    // เตรียม columns/rows ว่าง
    this.MOCK_COLUMNS[tableId] = [];
    this.MOCK_ROWS[tableId] = [];

    if (useAutoIncrement) {
      const idCol: ColumnDto = {
        columnId: this.newId(),
        tableId,
        name: 'ID',             // <— ตามสเปคคุณ
        dataType: 'INTEGER',
        isPrimary: true,
        isNullable: false,
      };
      this.MOCK_COLUMNS[tableId].push(idCol);
      // ให้แน่ใจว่ามี PK เดียว
      this.ensureSinglePrimaryKey(tableId, idCol.columnId);
    }

    return of(table).pipe(delay(180));
  }

  /** (ออปชัน) เปลี่ยนชื่อ table */
  renameTable(tableId: number, nextName: string): Observable<TableListItem> {
    const idx = this.MOCK_TABLES.findIndex(t => t.tableId === tableId);
    if (idx >= 0) {
      this.MOCK_TABLES[idx] = { ...this.MOCK_TABLES[idx], name: nextName?.trim() || this.MOCK_TABLES[idx].name };
      return of(this.MOCK_TABLES[idx]).pipe(delay(120));
    }
    return of(null as any).pipe(delay(120));
  }

  /** (ออปชัน) ลบ table */
  deleteTable(tableId: number): Observable<void> {
    this.MOCK_TABLES = this.MOCK_TABLES.filter(t => t.tableId !== tableId);
    delete this.MOCK_COLUMNS[tableId];
    delete this.MOCK_ROWS[tableId];
    return of(void 0).pipe(delay(120));
  }

  // --------------------------------------
  // Columns
  // --------------------------------------
  listColumnsLite(tableId: number): Observable<ColumnListItem[]> {
    const items = (this.MOCK_COLUMNS[tableId] ?? []).map(c => ({ columnId: c.columnId, name: c.name }));
    return of(items).pipe(delay(100));
  }

  listColumns(tableId: number): Observable<ColumnDto[]> {
    return of(this.MOCK_COLUMNS[tableId] ?? []).pipe(delay(100));
  }

  /** ✅ ถ้า col ใหม่ถูกตั้งเป็น PK → mock จะยกเลิก PK อื่น ๆ ให้อัตโนมัติ (เหลือ PK เดียว) */
  createColumn(tableId: number, dto: Partial<ColumnDto>): Observable<ColumnDto> {
    const col: ColumnDto = {
      columnId: this.newId(1e6),
      tableId,
      name: (dto.name ?? 'NewField').toString(),
      dataType: (dto.dataType ?? 'TEXT').toString().toUpperCase(),
      isPrimary: !!dto.isPrimary,
      isNullable: dto.isNullable ?? true,
    };

    const cols = this.MOCK_COLUMNS[tableId] ?? [];
    cols.push(col);
    this.MOCK_COLUMNS[tableId] = cols;

    if (col.isPrimary) {
      this.ensureSinglePrimaryKey(tableId, col.columnId);
    }

    return of(col).pipe(delay(120));
  }

  updateColumn(columnId: number, patch: Partial<ColumnDto>): Observable<ColumnDto> {
    for (const tableId in this.MOCK_COLUMNS) {
      const cols = this.MOCK_COLUMNS[tableId];
      const i = cols.findIndex(c => c.columnId === columnId);
      if (i >= 0) {
        const next = { ...cols[i], ...patch };
        // ถ้ามีการสลับเป็น PK → ให้เหลือ PK เดียว
        if (patch.isPrimary) {
          this.ensureSinglePrimaryKey(Number(tableId), columnId);
          next.isPrimary = true;
        }
        cols[i] = next;
        return of(cols[i]).pipe(delay(120));
      }
    }
    return of(null as any).pipe(delay(120));
  }

  deleteColumn(columnId: number): Observable<void> {
    for (const tableId in this.MOCK_COLUMNS) {
      this.MOCK_COLUMNS[tableId] = this.MOCK_COLUMNS[tableId].filter(c => c.columnId !== columnId);
    }
    return of(void 0).pipe(delay(120));
  }

  // --------------------------------------
  // Rows
  // --------------------------------------
  listRows(tableId: number): Observable<RowDto[]> {
    return of(this.MOCK_ROWS[tableId] ?? []).pipe(delay(120));
  }

  /** ✅ Mock auto-increment:
   *  - มี PK → ถ้า payload ไม่มี/ว่าง → เติมเป็น (max+1)
   *  - ไม่มี PK → ไม่ยุ่ง
   */
  createRow(tableId: number, data: Record<string, any>): Observable<RowDto> {
    const cols = this.MOCK_COLUMNS[tableId] ?? [];
    const pkCol = cols.find(c => c.isPrimary);
    const payload = { ...data };

    if (pkCol) {
      const pkName = pkCol.name;
      const hasPk = payload[pkName] !== undefined && payload[pkName] !== null && payload[pkName] !== '';
      if (!hasPk) {
        const rows = this.MOCK_ROWS[tableId] ?? [];
        let max = 0;
        for (const r of rows) {
          try {
            const obj = JSON.parse(r.data || '{}');
            const v = Number(obj[pkName]);
            if (!Number.isNaN(v)) max = Math.max(max, v);
          } catch {}
        }
        payload[pkName] = max + 1; // running
      }
    }

    const row: RowDto = {
      rowId: this.newId(1e9),
      tableId,
      data: JSON.stringify(payload),
      createdAt: new Date().toISOString(),
    };
    this.MOCK_ROWS[tableId] = [...(this.MOCK_ROWS[tableId] ?? []), row];
    return of(row).pipe(delay(120));
  }

  /** ✅ กันพลาด: แม้ FE จะส่งค่าใหม่ของ PK มา → mock จะ “ล็อก” ให้คงค่าเดิม */
  updateRow(rowId: number, data: Record<string, any>): Observable<RowDto> {
    for (const tableId in this.MOCK_ROWS) {
      const list = this.MOCK_ROWS[tableId];
      const idx = list.findIndex(r => r.rowId === rowId);
      if (idx >= 0) {
        const oldObj = JSON.parse(list[idx].data || '{}');
        const newObj = { ...data };

        // ล็อกค่า PK ตามของเดิม
        const pkCol = this.getPrimaryKeyCol(Number(tableId));
        if (pkCol) {
          const pkName = pkCol.name;
          newObj[pkName] = oldObj[pkName];
        }

        list[idx] = { ...list[idx], data: JSON.stringify(newObj) };
        return of(list[idx]).pipe(delay(120));
      }
    }
    return of(null as any).pipe(delay(120));
  }

  /** ✅ อัปเดต ‘ฟิลด์เดียว’ ของแถว — ใช้กับอัปโหลดรูป */
  updateRowField(rowId: number, field: string, value: any): Observable<RowDto> {
    for (const tableId in this.MOCK_ROWS) {
      const list = this.MOCK_ROWS[tableId];
      const idx = list.findIndex(r => r.rowId === rowId);
      if (idx >= 0) {
        const obj = JSON.parse(list[idx].data || '{}');

        // ล็อก PK ไม่ให้แก้ โดยตรวจเทียบชื่อคอลัมน์
        const pkCol = this.getPrimaryKeyCol(Number(tableId));
        if (!pkCol || pkCol.name !== field) {
          obj[field] = value;
        }

        list[idx] = { ...list[idx], data: JSON.stringify(obj) };
        return of(list[idx]).pipe(delay(100));
      }
    }
    return of(null as any).pipe(delay(100));
  }

  deleteRow(rowId: number): Observable<void> {
    for (const tableId in this.MOCK_ROWS) {
      this.MOCK_ROWS[tableId] = this.MOCK_ROWS[tableId].filter(r => r.rowId !== rowId);
    }
    return of(void 0).pipe(delay(100));
  }

  // (ยังคงไว้ได้ แม้ UI จะไม่ใช้แล้ว)
  nextRunningId(tableId: number, pkName: string): Observable<number> {
    const rows = this.MOCK_ROWS[tableId] ?? [];
    let max = 0;
    for (const r of rows) {
      const obj = JSON.parse(r.data || '{}');
      const v = Number(obj[pkName]);
      if (!Number.isNaN(v)) max = Math.max(max, v);
    }
    return of(max + 1).pipe(delay(60));
  }

  // ------- Upload (mock: DataURL) -------
  uploadImage(file: File, meta?: { tableId?: number; rowId?: number; columnId?: number }): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        const fakeUrl = reader.result as string;
        setTimeout(() => resolve(fakeUrl), 500);
      };
      reader.readAsDataURL(file);
    });
  }

  // ------- Remote paging -------
  listRowsPaged(
    tableId: number,
    page: number,    // 1-based
    size: number
  ): Observable<{ rows: RowDto[]; total: number }> {
    const all = this.MOCK_ROWS[tableId] ?? [];
    const total = all.length;
    const start = (page - 1) * size;
    const rows  = all.slice(start, start + size);
    return of({ rows, total }).pipe(delay(120));
  }
}
