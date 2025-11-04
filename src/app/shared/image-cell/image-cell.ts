import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-image-cell',
  standalone: true,
  imports: [],
  templateUrl: './image-cell.html',
  styleUrl: './image-cell.css',
})
export class ImageCell {
  /** รองรับทั้ง URL จาก backend หรือ base64/Blob URL */
  private _src: string | null = null;
  @Input() set src(v: string | null | undefined) {
    this._src = v ?? null;
    this.previewUrl = this._src;
  }
  get src() { return this._src; }

  /** เมื่อเปลี่ยนรูป: ส่งไฟล์จริงให้ parent อัปโหลด/บันทึก */
  @Output() changed = new EventEmitter<{ file?: File; dataUrl?: string; objectUrl?: string }>();
  /** เผื่อไว้ หากภายนอกอยากล้างค่า */
  @Output() cleared = new EventEmitter<void>();

  previewUrl: string | null = null;
  private objectUrl?: string;

  onFile(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // พรีวิวทันที
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.objectUrl = URL.createObjectURL(file);
    this.previewUrl = this.objectUrl;

    this.changed.emit({ file, objectUrl: this.objectUrl });
  }

  /** ถ้าภายนอกเรียกใช้เพื่อเคลียร์รูป */
  clear() {
    this.previewUrl = null;
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
    this.cleared.emit();
  }
}
