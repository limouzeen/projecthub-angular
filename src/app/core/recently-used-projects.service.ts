import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

export interface RecentlyUsedProject {
  projectId: number;
  name: string;
  tables: number;
  lastOpened: string;   // ISO datetime
  openCount: number;
}

const STORAGE_KEY = 'ph:recently-used';

@Injectable({ providedIn: 'root' })
export class RecentlyUsedProjectsService {

  // โหลดจาก localStorage (mock ง่าย ๆ)
  private load(): RecentlyUsedProject[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) as RecentlyUsedProject[] : [];
    } catch {
      return [];
    }
  }

  private save(list: RecentlyUsedProject[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch {
      // เงียบ ๆ ไป ถ้า quota เต็ม
    }
  }

  /** ดึงรายการ recently used (mock: delay ให้ฟีล API) */
  getRecentlyUsed(): Observable<RecentlyUsedProject[]> {
    const list = this.load();
    return of(list).pipe(delay(120));
  }

  /** เรียกทุกครั้งที่ user เข้าโปรเจกต์ */
  markOpened(projectId: number, name: string, tables: number) {
    const now = new Date().toISOString();
    const list = this.load();
    const idx = list.findIndex(p => p.projectId === projectId);

    if (idx >= 0) {
      const current = list[idx];
      list[idx] = {
        ...current,
        name,
        tables,
        lastOpened: now,
        openCount: (current.openCount || 0) + 1,
      };
    } else {
      list.unshift({
        projectId,
        name,
        tables,
        lastOpened: now,
        openCount: 1,
      });
    }

    // จำกัดสัก 30 รายการกันบวม
    const trimmed = list
      .sort((a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime())
      .slice(0, 30);

    this.save(trimmed);
  }
}
