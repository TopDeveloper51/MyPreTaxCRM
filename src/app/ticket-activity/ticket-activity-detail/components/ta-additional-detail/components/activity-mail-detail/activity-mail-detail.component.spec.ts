import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityMailDetailComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-conditional/components/activity-mail-detail/activity-mail-detail.component';

describe('ActivityMailDetailComponent', () => {
  let component: ActivityMailDetailComponent;
  let fixture: ComponentFixture<ActivityMailDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityMailDetailComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityMailDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
