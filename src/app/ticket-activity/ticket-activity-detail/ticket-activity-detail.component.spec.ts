import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketActivityDetailComponent } from '@app/ticket-activity/ticket-activity-detail/ticket-activity-detail.component';

describe('TicketActivityDetailComponent', () => {
  let component: TicketActivityDetailComponent;
  let fixture: ComponentFixture<TicketActivityDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TicketActivityDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TicketActivityDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
