import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivitySpecialTaskComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-conditional/components/activity-special-task/activity-special-task.component';

describe('ActivitySpecialTaskComponent', () => {
  let component: ActivitySpecialTaskComponent;
  let fixture: ComponentFixture<ActivitySpecialTaskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivitySpecialTaskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivitySpecialTaskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
