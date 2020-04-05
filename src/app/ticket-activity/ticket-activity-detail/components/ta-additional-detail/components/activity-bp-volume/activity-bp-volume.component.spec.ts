import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityBpVolumeComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-additional-detail/components/activity-bp-volume/activity-bp-volume.component';

describe('ActivityBpVolumeComponent', () => {
  let component: ActivityBpVolumeComponent;
  let fixture: ComponentFixture<ActivityBpVolumeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ActivityBpVolumeComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityBpVolumeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
