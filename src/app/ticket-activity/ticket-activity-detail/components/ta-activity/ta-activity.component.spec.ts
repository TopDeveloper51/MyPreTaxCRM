import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TAActivityComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/ta-activity.component';

describe('TAActivityComponent', () => {
  let component: TAActivityComponent;
  let fixture: ComponentFixture<TAActivityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TAActivityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TAActivityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
