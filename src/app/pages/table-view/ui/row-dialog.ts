import { Component, EventEmitter, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type RowDialogSave = Record<string, any>;

export type RowDialogColumn = {
  name: string;
  dataType?: string;      // 'INTEGER' | 'REAL' | 'BOOLEAN' | 'TEXT' | 'STRING' | 'IMAGE' | 'LOOKUP' | 'FORMULA' ...
  isPrimary?: boolean;
  isNullable?: boolean;
};

@Component({
  selector: 'ph-row-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './row-dialog.html',
  styleUrls: ['./row-dialog.css'],
})
export class RowDialog implements OnChanges {
  /** เปิด/ปิดไดอะล็อก */
  @Input() open = false;

  /** สคีมาคอลัมน์ของตาราง */
  @Input() columns: RowDialogColumn[] = [];

  /** ค่าเริ่มต้นของแถวที่จะแก้ไข (null = เพิ่มแถวใหม่) */
  @Input() initData: Record<string, any> | null = null;

  /** กดบันทึก -> ส่งโมเดลกลับ */
  @Output() save = new EventEmitter<RowDialogSave>();

  /** ยกเลิก */
  @Output() cancel = new EventEmitter<void>();

  /** แบบฟอร์มทำงานกับ ngModel */
  model: Record<string, any> = {};

  // ==============================
  // Lifecycle
  // ==============================
  ngOnChanges(changes: SimpleChanges): void {
  if ((changes['open'] && this.open) || changes['initData']) {
    this.model = { ...(this.initData ?? {}) };

    for (const c of this.columns) {
      // ✅ บรรทัดนี้สำคัญ: บังคับ undefined → false (กัน error ใน template)
      c.isPrimary = !!c.isPrimary;

      if (!(c.name in this.model)) {
        const t = (c.dataType || '').toUpperCase();
        this.model[c.name] = t === 'BOOLEAN' ? false : '';
      }
    }
  }
}

  // ==============================
  // Normalize ก่อน Save
  // ==============================
  private normalizeBeforeSave(src: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};

    for (const c of this.columns) {
      const key = c.name;
      const t = (c.dataType || '').toUpperCase();
      let v = src[key];

      // ✅ ถ้าเป็น Primary Key → ใช้ค่าจาก initData (ห้ามแก้)
      if (c.isPrimary) {
        out[key] =
          (this.initData && this.initData[key] !== undefined)
            ? this.initData[key]
            : (src[key] ?? null);
        continue;
      }

      // ✅ ถ้าเป็นค่าว่าง → ส่ง null ให้ backend
      if (v === '' || v === undefined) {
        out[key] = null;
        continue;
      }

      // ✅ แปลงตามชนิดข้อมูล
      switch (t) {
        case 'INTEGER':
          out[key] = Number.parseInt(v as any, 10);
          break;
        case 'REAL':
          out[key] = Number.parseFloat(v as any);
          break;
        case 'BOOLEAN':
          out[key] = !!v;
          break;
        default:
          out[key] = v;
      }
    }

    return out;
  }

  // ==============================
  // Actions
  // ==============================
  /** กด Save */
  onSubmit(): void {
    const normalized = this.normalizeBeforeSave(this.model);
    this.save.emit(normalized);
  }

  /** กด Cancel */
  onCancel(): void {
    // ✅ เคลียร์ model กันค่าค้างรอบหน้า
    this.model = {};
    this.cancel.emit();
  }
}
