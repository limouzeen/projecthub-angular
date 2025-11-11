import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule, Location, DatePipe, NgClass } from '@angular/common';
import { Router } from '@angular/router';
import {
  RecentlyUsedProjectsService,
  RecentlyUsedProject,
} from '../../core/recently-used-projects.service';
import { FooterStateService } from '../../core/footer-state.service';

@Component({
  selector: 'app-recently-used-projects',
  standalone: true,
  imports: [CommonModule, DatePipe, NgClass],
  templateUrl: './recently-used.html',
  styleUrl: './recently-used.css', // ใช้ไฟล์เดียวกับ favorite ได้ หรือแยกก็ได้
})
export class RecentlyUsedProjects implements OnInit, OnDestroy {
  private readonly svc = inject(RecentlyUsedProjectsService);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly footer = inject(FooterStateService);

  // UI
  asideOpen = signal(false);
  profileOpen = signal(false);

  // data
  keyword = signal('');
  loading = signal(true);
  items = signal<RecentlyUsedProject[]>([]);

  // paging
  pageIndex = signal(0);
  readonly pageSize = signal(5);

  constructor() {}

  // ===== Derived =====

  filtered = computed(() => {
    const q = this.keyword().trim().toLowerCase();
    // เรียงตาม lastOpened จากล่าสุด -> เก่าสุด
    const sorted = [...this.items()].sort(
      (a, b) => new Date(b.lastOpened).getTime() - new Date(a.lastOpened).getTime()
    );

    if (!q) return sorted;
    return sorted.filter(p => (p.name ?? '').toLowerCase().includes(q));
  });

  pageCount = computed(() => {
    const total = this.filtered().length;
    const size = this.pageSize();
    return total ? Math.max(1, Math.ceil(total / size)) : 1;
  });

  pages = computed(() =>
    Array.from({ length: this.pageCount() }, (_, i) => i)
  );

  paged = computed(() => {
    const list = this.filtered();
    const size = this.pageSize();
    const maxIndex = this.pageCount() - 1;
    const safeIndex = Math.min(this.pageIndex(), maxIndex);
    const start = safeIndex * size;
    return list.slice(start, start + size);
  });

  pageStart = computed(() => {
    const total = this.filtered().length;
    if (!total) return 0;
    return this.pageIndex() * this.pageSize() + 1;
  });

  pageEnd = computed(() => {
    const total = this.filtered().length;
    if (!total) return 0;
    const end = (this.pageIndex() + 1) * this.pageSize();
    return end > total ? total : end;
  });

  // ===== Lifecycle =====

  ngOnInit(): void {
    this.footer.setThreshold(690);
    this.footer.setForceCompact(null);

    this.svc.getRecentlyUsed().subscribe(list => {
      this.items.set(list);
      this.loading.set(false);
      this.pageIndex.set(0);
    });
  }

  ngOnDestroy(): void {
    this.footer.resetAll();
  }

  // ===== Topbar / navigation =====

  onBack() {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigateByUrl('/dashboard');
    }
  }

  toggleProfileMenu() {
    this.profileOpen.update(v => !v);
  }

  onEditProfile() {
    this.profileOpen.set(false);
    this.router.navigateByUrl('/profile/edit');
  }

  onLogout() {
    this.profileOpen.set(false);
    this.router.navigateByUrl('/login');
  }

  toggleAside() {
    this.asideOpen.update(v => !v);
  }

  @HostListener('document:click')
  onDocClick() {
    if (this.profileOpen()) this.profileOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.profileOpen()) this.profileOpen.set(false);
    if (this.asideOpen()) this.asideOpen.set(false);
  }

  // ===== Paging =====

  prevPage() {
    const i = this.pageIndex();
    if (i > 0) this.pageIndex.set(i - 1);
  }

  nextPage() {
    const i = this.pageIndex();
    if (i < this.pageCount() - 1) this.pageIndex.set(i + 1);
  }

  gotoPage(i: number) {
    if (i >= 0 && i < this.pageCount()) this.pageIndex.set(i);
  }

  // ===== Actions =====

  onOpenProject(p: RecentlyUsedProject) {
    // log access ซ้ำอีกทีก็ได้ (จะดันขึ้นบน)
    this.svc.markOpened(p.projectId, p.name, p.tables);
    this.router.navigate(['/projects', p.projectId]);
  }
}
