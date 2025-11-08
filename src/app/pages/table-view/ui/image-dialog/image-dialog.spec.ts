import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImageDialog } from './image-dialog';

describe('ImageDialog', () => {
  let component: ImageDialog;
  let fixture: ComponentFixture<ImageDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImageDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
