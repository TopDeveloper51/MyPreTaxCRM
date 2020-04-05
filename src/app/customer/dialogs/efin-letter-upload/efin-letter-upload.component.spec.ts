import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EfinLetterUploadComponent } from '@app/customer/dialogs/efin-letter-upload/efin-letter-upload.component';

describe('EfinLetterUploadComponent', () => {
  let component: EfinLetterUploadComponent;
  let fixture: ComponentFixture<EfinLetterUploadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EfinLetterUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EfinLetterUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
