import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecentlyUsedProjects } from './recently-used';

describe('RecentlyUsedProjects', () => {
  let component: RecentlyUsedProjects;
  let fixture: ComponentFixture<RecentlyUsedProjects>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecentlyUsedProjects]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecentlyUsedProjects);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
