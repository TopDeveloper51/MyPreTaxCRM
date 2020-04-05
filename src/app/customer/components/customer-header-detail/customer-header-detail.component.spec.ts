import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerHeaderDetailComponent } from '@app/customer/components/customer-header-detail/customer-header-detail.component';

describe('CustomerHeaderDetailComponent', () => {
  let component: CustomerHeaderDetailComponent;
  let fixture: ComponentFixture<CustomerHeaderDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerHeaderDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerHeaderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
