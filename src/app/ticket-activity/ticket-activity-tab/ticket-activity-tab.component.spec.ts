import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketActivityTabComponent } from '@app/ticket-activity/ticket-activity-tab/ticket-activity-tab.component';

describe('TicketActivityTabComponent', () => {
  let component: TicketActivityTabComponent;
  let fixture: ComponentFixture<TicketActivityTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketActivityTabComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketActivityTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
