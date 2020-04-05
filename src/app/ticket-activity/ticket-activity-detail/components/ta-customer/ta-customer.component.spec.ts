import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TACustomerComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-customer/ta-customer.component';

describe('TACustomerComponent', () => {
  let component: TACustomerComponent;
  let fixture: ComponentFixture<TACustomerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TACustomerComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TACustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
