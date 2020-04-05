import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketSetupComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/ticket-setup/ticket-setup.component';

describe('TicketSetupComponent', () => {
  let component: TicketSetupComponent;
  let fixture: ComponentFixture<TicketSetupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketSetupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketSetupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
