import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-table-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-table-dialog.html',
  styleUrl: './create-table-dialog.css',
})
export class CreateTableDialog {
  // เปิด/ปิด dialog (ควบคุมโดย parent)
  @Input() open = false;

  // ส่งอีเวนต์กลับไปยัง parent
  @Output() close = new EventEmitter<void>();
  @Output() submit = new EventEmitter<{ name: string; useAutoIncrement: boolean }>();

  // ฟอร์ม (ใช้ signal ตามสไตล์ใหม่)
  readonly name = signal('');
  readonly useAutoIncrement = signal<boolean>(true);  // ควบคุมการเลือก Auto-increment

  onCreate() {
    const n = this.name().trim();
    if (!n) return;
    this.submit.emit({ name: n, useAutoIncrement: this.useAutoIncrement() });  // ส่งค่าผ่าน emit
    this.resetAndClose();
  }

  onCancel() {
    this.resetAndClose();
  }

  private resetAndClose() {
    this.name.set('');
    this.useAutoIncrement.set(true);  // ตั้งค่าหมายเหตุว่าเลือก Auto-increment เป็น default
    this.close.emit();
  }
}
