import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type ImageDialogMode = 'url' | 'delete';

@Component({
  selector: 'ph-image-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './image-dialog.html',
  styleUrls: ['./image-dialog.css'],
})
export class ImageDialog implements OnChanges {
  @Input() open = false;
  @Input() mode: ImageDialogMode = 'url';
  @Input() currentUrl: string | null = null;

  @Output() saveUrl = new EventEmitter<string>();
  @Output() confirmDelete = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  url = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open'] && this.open && this.mode === 'url') {
      this.url = this.currentUrl || '';
    }
    if (changes['mode'] && this.mode === 'url' && this.open) {
      this.url = this.currentUrl || '';
    }
  }

  onCancel() {
    this.cancel.emit();
  }

  onSaveUrl() {
    const trimmed = (this.url || '').trim();
    if (!trimmed) return;
    this.saveUrl.emit(trimmed);
  }

  onConfirmDelete() {
    this.confirmDelete.emit();
  }
}
