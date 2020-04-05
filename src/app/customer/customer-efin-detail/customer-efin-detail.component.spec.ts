import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerEfinDetailComponent } from '@app/customer/customer-efin-detail/customer-efin-detail.component';

describe('CustomerEfinDetailComponent', () => {
  let component: CustomerEfinDetailComponent;
  let fixture: ComponentFixture<CustomerEfinDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerEfinDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerEfinDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
