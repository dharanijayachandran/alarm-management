import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportFilesToComponent } from './export-files-to.component';

describe('ExportFilesToComponent', () => {
  let component: ExportFilesToComponent;
  let fixture: ComponentFixture<ExportFilesToComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExportFilesToComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportFilesToComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
