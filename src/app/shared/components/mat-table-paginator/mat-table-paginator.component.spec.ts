import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MatTablePaginatorComponent } from './mat-table-paginator.component';

describe('MatTablePaginatorComponent', () => {
  let component: MatTablePaginatorComponent;
  let fixture: ComponentFixture<MatTablePaginatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MatTablePaginatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MatTablePaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
