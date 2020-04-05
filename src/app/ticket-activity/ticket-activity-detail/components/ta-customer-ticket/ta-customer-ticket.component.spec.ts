import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TACustomerTicketComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-customer-ticket/ta-customer-ticket.component';

describe('TACustomerTicketComponent', () => {
  let component: TACustomerTicketComponent;
  let fixture: ComponentFixture<TACustomerTicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TACustomerTicketComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TACustomerTicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
