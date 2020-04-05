import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EfinHistoryComponent } from '@app/customer/dialogs/efin-history/efin-history.component';

describe('EfinHistoryComponent', () => {
  let component: EfinHistoryComponent;
  let fixture: ComponentFixture<EfinHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfinHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfinHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
