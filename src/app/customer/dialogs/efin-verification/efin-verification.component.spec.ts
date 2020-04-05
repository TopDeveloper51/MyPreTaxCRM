import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EfinVerificationComponent } from '@app/customer/dialogs/efin-verification/efin-verification.component';

describe('EfinVerificationComponent', () => {
  let component: EfinVerificationComponent;
  let fixture: ComponentFixture<EfinVerificationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfinVerificationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfinVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
