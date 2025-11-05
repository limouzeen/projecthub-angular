import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTableDialog } from './create-table-dialog';

describe('CreateTableDialog', () => {
  let component: CreateTableDialog;
  let fixture: ComponentFixture<CreateTableDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTableDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateTableDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
