import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ProjectDetailService, TableDto } from '../../core/project-detail.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-project-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
})
export class ProjectDetail implements OnInit {
  // Services
  private readonly api    = inject(ProjectDetailService);
  private readonly router = inject(Router);
  private readonly route  = inject(ActivatedRoute);

  // Project id (จาก route; ถ้าไม่มี fallback = 1)
  projectId = 1;

  // UI state
  readonly tables      = signal<TableDto[]>([]);
  readonly q           = signal('');
  readonly loading     = signal(false);
  readonly creating    = signal(false);
  readonly renamingId  = signal<number | null>(null);
  readonly deletingId  = signal<number | null>(null);

  // filter
  readonly filtered = computed(() => {
    const keyword = this.q().toLowerCase().trim();
    return !keyword ? this.tables() : this.tables().filter(t => t.name.toLowerCase().includes(keyword));
  });

  async ngOnInit() {
    const fromRoute = Number(this.route.snapshot.paramMap.get('projectId') ?? this.route.snapshot.paramMap.get('id') ?? '0');
    if (!Number.isNaN(fromRoute) && fromRoute > 0) this.projectId = fromRoute;

    // (ช่วยให้เห็นตารางทันทีตอนมาจาก Dashboard mock)
    this.api.ensureInitialMockTables(this.projectId);

    await this.refresh();
  }

  async refresh() {
    this.loading.set(true);
    try {
      const res$ = this.api.listTables(this.projectId);
      this.tables.set(await firstValueFrom(res$));
    } finally {
      this.loading.set(false);
    }
  }

  // ✅ สร้างตาราง + ส่ง useAutoIncrement/isPrimaryKey
  async createTable() {
    const name = prompt('Table name?');
    if (!name) return;

    // เก็บค่า options แบบง่าย ๆ (mock-friendly)
    const useAutoIncrement = confirm('Add AUTO_INCREMENT primary key?');
    const isPrimaryKey = useAutoIncrement ? true : confirm('Mark as Primary Key?');

    this.creating.set(true);
    try {
      await firstValueFrom(
        this.api.createTable(this.projectId, name, {
          useAutoIncrement,
          isPrimaryKey,
        })
      );
      await this.refresh();
    } finally {
      this.creating.set(false);
    }
  }

  async renameTable(t: TableDto) {
    const name = prompt('Rename table:', t.name);
    if (!name || name === t.name) return;

    this.renamingId.set(t.tableId);
    try {
      await firstValueFrom(this.api.renameTable(t.tableId, name));
      await this.refresh();
    } finally {
      this.renamingId.set(null);
    }
  }

  async deleteTable(t: TableDto) {
    if (!confirm(`Delete table "${t.name}"?`)) return;

    this.deletingId.set(t.tableId);
    try {
      await firstValueFrom(this.api.deleteTable(t.tableId));
      await this.refresh();
    } finally {
      this.deletingId.set(null);
    }
  }

  open(t: TableDto) {
    this.router.navigate(['/table', t.tableId]); // /table/:id
  }
}
