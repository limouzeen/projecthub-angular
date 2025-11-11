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
  const mock: RecentlyUsedProject[] = [
    {
      projectId: 1,
      name: 'Sales Analytics',
      tables: 8,
      lastOpened: '2025-11-12T10:45:00Z',
      openCount: 18,
    },
    {
      projectId: 1002,
      name: 'Marketing Campaign 2025',
      tables: 15,
      lastOpened: '2025-11-12T09:20:00Z',
      openCount: 25,
    },
    {
      projectId: 2001,
      name: 'Inventory Management',
      tables: 10,
      lastOpened: '2025-11-11T21:05:00Z',
      openCount: 12,
    },
    {
      projectId: 2002,
      name: 'Customer Data Platform',
      tables: 9,
      lastOpened: '2025-11-11T16:30:00Z',
      openCount: 7,
    },
    {
      projectId: 2003,
      name: 'HR Employee Records',
      tables: 6,
      lastOpened: '2025-11-11T08:50:00Z',
      openCount: 5,
    },
    {
      projectId: 2004,
      name: 'E-commerce Orders Tracker',
      tables: 11,
      lastOpened: '2025-11-10T19:40:00Z',
      openCount: 14,
    },
    {
      projectId: 2005,
      name: 'Support Ticket Insights',
      tables: 7,
      lastOpened: '2025-11-10T14:10:00Z',
      openCount: 9,
    },
    {
      projectId: 2006,
      name: 'Finance Dashboard',
      tables: 5,
      lastOpened: '2025-11-09T23:15:00Z',
      openCount: 6,
    },
    {
      projectId: 2007,
      name: 'Branch Performance',
      tables: 4,
      lastOpened: '2025-11-09T10:05:00Z',
      openCount: 3,
    },
    {
      projectId: 2008,
      name: 'Product Feedback Hub',
      tables: 6,
      lastOpened: '2025-11-08T18:25:00Z',
      openCount: 4,
    },
  ];

  return of(mock).pipe(delay(160));
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
