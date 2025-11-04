import { Component, EventEmitter, Input, Output, signal, inject, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import {
  TableViewService,
  FieldDialogModel,
  TableListItem,
  ColumnListItem,
} from '../table-view.service';

type Preset =
  | 'Identifier'   // PK auto, not null, INTEGER
  | 'Text'
  | 'Number'
  | 'Price'
  | 'Date'
  | 'YesNo'
  | 'ImageUrl'
  | 'Lookup'
  | 'Formula';

@Component({
  selector: 'ph-field-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './field-dialog.html',
  styleUrls: ['./field-dialog.css'],
})
export class FieldDialog implements OnChanges {
  @Input() open = false;
  @Input({ required: true }) tableId!: number;
  @Output() save = new EventEmitter<FieldDialogModel>();
  @Output() cancel = new EventEmitter<void>();

  private readonly api = inject(TableViewService);

  // form
  name = '';
  preset: Preset = 'Text';

  // technical (ซ่อนไว้ใน Advanced; จะถูกเติมอัตโนมัติจาก preset)
  isNullable = true;
  isPrimary = false;
  dataType: 'TEXT'|'INTEGER'|'REAL'|'BOOLEAN'|'STRING'|'IMAGE'|'LOOKUP'|'FORMULA' = 'TEXT';

  // lookup
  targetTableId: number|null = null;
  targetColumnId: number|null = null;

  // formula
  formulaDefinition = ''; // JSON string

  // lists
  readonly tables = signal<TableListItem[]>([]);
  readonly targetCols = signal<ColumnListItem[]>([]);
  readonly showAdvanced = signal(false);

  async ngOnChanges() {
    if (!this.open) return;
    const tabs = (await firstValueFrom(this.api.listTables())) ?? [];
this.tables.set(tabs);

    this.applyPreset(); // ตั้งค่าตาม preset ตอนเปิด
  }

  onPresetChange() {
    this.applyPreset();
  }

  private applyPreset() {
    // default
    this.isPrimary = false;
    this.isNullable = true;

    switch (this.preset) {
      case 'Identifier':
        this.dataType = 'INTEGER';
        this.isPrimary = true;
        this.isNullable = false;
        break;
      case 'Text':
        this.dataType = 'TEXT';
        break;
      case 'Number':
        this.dataType = 'REAL';
        break;
      case 'Price':
        this.dataType = 'REAL';
        break;
      case 'Date':
        // เก็บเป็น STRING (ISO) หรือ TEXT ตามที่หลังบ้านรองรับ
        this.dataType = 'STRING';
        break;
      case 'YesNo':
        this.dataType = 'BOOLEAN';
        break;
      case 'ImageUrl':
        this.dataType = 'IMAGE';
        break;
      case 'Lookup':
        this.dataType = 'LOOKUP';
        break;
      case 'Formula':
        this.dataType = 'FORMULA';
        break;
    }
  }

  async onSelectTargetTable() {
    if (!this.targetTableId) { this.targetCols.set([]); return; }
    const cols = (await firstValueFrom(this.api.listColumnsLite(this.targetTableId))) ?? [];
this.targetCols.set(cols);

  }

  submit() {
    const model: FieldDialogModel = {
      name: this.name.trim(),
      // ส่งชนิดที่ Validator ฝั่งหลังบ้านเข้าใจ
      dataType: this.dataType,
      isNullable: this.isNullable,
      isPrimary: this.isPrimary,
      // lookup
      targetTableId: this.preset === 'Lookup' ? this.targetTableId : null,
      targetColumnId: this.preset === 'Lookup' ? this.targetColumnId : null,
      // formula
      formulaDefinition: this.preset === 'Formula' ? (this.formulaDefinition || null) : null,
    };
    this.save.emit(model);
  }

  close() { this.cancel.emit(); }
}
