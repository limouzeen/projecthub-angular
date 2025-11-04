import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageCell } from './image-cell';

describe('ImageCell', () => {
  let component: ImageCell;
  let fixture: ComponentFixture<ImageCell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageCell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageCell);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
