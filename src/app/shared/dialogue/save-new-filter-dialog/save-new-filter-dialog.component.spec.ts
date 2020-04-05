import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveNewFilterDialogComponent } from '@app/shared/dialogue/save-new-filter-dialog/save-new-filter-dialog.component';

describe('SaveNewFilterDialogComponent', () => {
  let component: SaveNewFilterDialogComponent;
  let fixture: ComponentFixture<SaveNewFilterDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SaveNewFilterDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SaveNewFilterDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
