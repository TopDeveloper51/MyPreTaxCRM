import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ActivityDocumentUploadComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-conditional/components/activity-document-upload/activity-document-upload.component';

describe('ActivityDocumentUploadComponent', () => {
  let component: ActivityDocumentUploadComponent;
  let fixture: ComponentFixture<ActivityDocumentUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ActivityDocumentUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActivityDocumentUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
