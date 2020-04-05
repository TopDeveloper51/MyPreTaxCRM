import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityOrderRefundComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-conditional/components/activity-order-refund/activity-order-refund.component';

describe('ActivityOrderRefundComponent', () => {
  let component: ActivityOrderRefundComponent;
  let fixture: ComponentFixture<ActivityOrderRefundComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityOrderRefundComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityOrderRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
