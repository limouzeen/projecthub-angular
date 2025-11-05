import { Injectable, signal, computed } from '@angular/core';

export type Project = {
  id: number;                 // ใช้ number ให้ตรงกับฝั่ง .NET ง่าย ๆ
  name: string;
  updatedAt: string;          // ISO
  tables: number;
  favorite?: boolean;
};

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  // ให้ seq สูงกว่าไอดีปัจจุบันเพื่อกันชนตอน add()
  private seq = 1003;

  /**
   * ✅ ปรับให้มีโปรเจกต์ id: 1 ตรงกับ mock ของ ProjectDetailService
   *    เพื่อที่เวลาเปิด /projects/1 จะเห็นตาราง mock (Products, Orders) ทันที
   */
  private readonly _list = signal<Project[]>([
    { id: 1,    name: 'Sales Analytics',          updatedAt: new Date().toISOString(), tables: 8,  favorite: false },
    { id: 1002, name: 'Marketing Campaign 2025',  updatedAt: new Date().toISOString(), tables: 15, favorite: true  },
  ]);

  /** expose read-only signal */
  readonly list = computed(() => this._list());

  add(name: string) {
    const p: Project = { id: this.seq++, name, updatedAt: new Date().toISOString(), tables: 0, favorite: false };
    this._list.update(arr => [p, ...arr]);
  }

  remove(id: number) {
    this._list.update(arr => arr.filter(p => p.id !== id));
  }

  removeMany(ids: number[]) {
    const set = new Set(ids);
    this._list.update(arr => arr.filter(p => !set.has(p.id)));
  }

  toggleFavorite(id: number) {
    this._list.update(arr =>
      arr.map(p => (p.id === id ? { ...p, favorite: !p.favorite } : p))
    );
  }

  downloadCSV(rows: Project[]) {
    const header = ['id','name','updatedAt','tables','favorite'];
    const csv = [
      header.join(','),
      ...rows.map(r => [r.id, this.escape(r.name), r.updatedAt, String(r.tables), String(!!r.favorite)].join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'projects.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  private escape(s: string) {
    const needs = /[" ,\n]/.test(s);
    return needs ? `"${s.replace(/"/g, '""')}"` : s;
  }

  rename(id: number, name: string) {
    this._list.update(arr =>
      arr.map(p => (p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p))
    );
  }
}
