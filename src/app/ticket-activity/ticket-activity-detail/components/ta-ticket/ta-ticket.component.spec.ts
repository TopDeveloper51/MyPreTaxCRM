import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TATicketComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-ticket/ta-ticket.component';

describe('TATicketComponent', () => {
  let component: TATicketComponent;
  let fixture: ComponentFixture<TATicketComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TATicketComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TATicketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
