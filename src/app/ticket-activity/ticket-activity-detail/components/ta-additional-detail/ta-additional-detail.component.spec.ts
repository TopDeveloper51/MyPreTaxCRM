import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TAAdditionalDetailComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/ta-additional-detail.component';

describe('TAAdditionalDetailComponent', () => {
  let component: TAAdditionalDetailComponent;
  let fixture: ComponentFixture<TAAdditionalDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TAAdditionalDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TAAdditionalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
