import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityTicketComponent } from '@app/activity/dialog/activity-ticket/activity-ticket.component';

describe('ActivityTicketComponent', () => {
  let component: ActivityTicketComponent;
  let fixture: ComponentFixture<ActivityTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
