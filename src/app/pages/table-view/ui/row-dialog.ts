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

  ngOnChanges(changes: SimpleChanges): void {
    // เปิด dialog เมื่อ open=true และรีเฟรช model ทุกครั้งที่เปิด
    if (this.open) {
      // clone initData
      this.model = { ...(this.initData ?? {}) };

      // สร้าง key ให้ครบทุกคอลัมน์
      for (const c of this.columns) {
        if (!(c.name in this.model)) {
          // ค่า default ตามชนิด
          const t = (c.dataType || '').toUpperCase();
          if (t === 'BOOLEAN') this.model[c.name] = false;
          else this.model[c.name] = '';
        }
      }
    }
  }

  /** แปลงค่าตามชนิดก่อนส่งกลับ (เช่น number/boolean) */
  private normalizeBeforeSave(src: Record<string, any>): Record<string, any> {
    const out: Record<string, any> = {};
    for (const c of this.columns) {
      const key = c.name;
      const t = (c.dataType || '').toUpperCase();
      const v = src[key];

      if (v === '' || v === undefined) {
        out[key] = null; // ส่ง null เพื่อให้ฝั่งหลังบ้านตรวจตาม Is_nullable
        continue;
      }

      switch (t) {
        case 'INTEGER':
          out[key] = v === null ? null : Number.parseInt(v as any, 10);
          break;
        case 'REAL':
          out[key] = v === null ? null : Number.parseFloat(v as any);
          break;
        case 'BOOLEAN':
          out[key] = !!v;
          break;
        // LOOKUP/FORMULA เป็น read-only: ส่งค่ากลับตามที่มี (ปกติควรเพิกเฉยที่หลังบ้าน)
        default:
          out[key] = v;
      }
    }
    return out;
  }

  /** กด Save */
  onSubmit(): void {
    const normalized = this.normalizeBeforeSave(this.model);
    this.save.emit(normalized);
  }

  /** กด Cancel */
  onCancel(): void {
    this.cancel.emit();
  }
}
