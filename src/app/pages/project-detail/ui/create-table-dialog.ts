import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export type CreateTablePayload = {
  name: string;
  useAutoIncrement: boolean;
};

@Component({
  selector: 'app-create-table-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './create-table-dialog.html',
  styleUrl: './create-table-dialog.css',
})
export class CreateTableDialog {
  @Input() open = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() submit = new EventEmitter<CreateTablePayload>();

  name = signal('');
  useAutoIncrement = signal(true); 

  close() { this.cancel.emit(); }
  onCreate() {
    const n = this.name().trim();
    if (!n) return;
    this.submit.emit({ name: n, useAutoIncrement: this.useAutoIncrement() });
  }
}
