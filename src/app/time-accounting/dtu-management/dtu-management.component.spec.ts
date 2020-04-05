import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DTUManagementComponent } from './dtu-management.component';

describe('DTUManagementComponent', () => {
  let component: DTUManagementComponent;
  let fixture: ComponentFixture<DTUManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DTUManagementComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DTUManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
