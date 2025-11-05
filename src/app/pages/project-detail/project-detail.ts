import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { ProjectDetailService, TableDto } from '../../core/project-detail.service';
import { CreateTableDialog, CreateTablePayload } from './ui/create-table-dialog';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule, CreateTableDialog],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  private readonly api = inject(ProjectDetailService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  projectId = 1;

  readonly tables = signal<TableDto[]>([]);
  readonly q = signal('');
  readonly loading = signal(false);
  readonly creating = signal(false);
  readonly renamingId = signal<number | null>(null);
  readonly deletingId = signal<number | null>(null);

  readonly createOpen = signal(false);

  readonly filtered = computed(() => {
    const k = this.q().toLowerCase().trim();
    return !k ? this.tables() : this.tables().filter(t => t.name.toLowerCase().includes(k));
  });

  async ngOnInit() {
    const idFromRoute = Number(this.route.snapshot.paramMap.get('projectId') ?? this.route.snapshot.paramMap.get('id') ?? '0');
    if (!Number.isNaN(idFromRoute) && idFromRoute > 0) this.projectId = idFromRoute;
    await this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
      this.tables.set(await firstValueFrom(this.api.listTables(this.projectId)));
    } finally { this.loading.set(false); }
  }

  openCreateDialog() { this.createOpen.set(true); }
  closeCreateDialog() { this.createOpen.set(false); }

  /**  ส่ง { projectId, name, useAutoIncrement } */
  async handleCreate(payload: CreateTablePayload) {
    this.creating.set(true);
    try {
      await firstValueFrom(this.api.createTable(this.projectId, payload.name, payload.useAutoIncrement));
      await this.refresh();
    } finally {
      this.creating.set(false);
      this.closeCreateDialog();
    }
  }

  async renameTable(t: TableDto) { /* ... เหมือนเดิม ... */ }
  async deleteTable(t: TableDto) { /* ... เหมือนเดิม ... */ }
  open(t: TableDto) { this.router.navigate(['/table', t.tableId]); }
}
