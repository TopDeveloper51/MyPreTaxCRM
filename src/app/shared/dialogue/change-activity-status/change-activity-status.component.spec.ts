import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeActivityStatusComponent } from '@app/shared/dialogue/change-activity-status/change-activity-status.component';

describe('ChangeActivityStatusComponent', () => {
  let component: ChangeActivityStatusComponent;
  let fixture: ComponentFixture<ChangeActivityStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangeActivityStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangeActivityStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
