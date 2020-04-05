import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketHistoryComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-ticket/dialogs/ticket-history/ticket-history.component';

describe('TicketHistoryComponent', () => {
  let component: TicketHistoryComponent;
  let fixture: ComponentFixture<TicketHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
