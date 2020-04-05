import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KnowledgebaseDetailComponent } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/knowledgebase-detail/knowledgebase-detail.component';

describe('KnowledgebaseDetailComponent', () => {
  let component: KnowledgebaseDetailComponent;
  let fixture: ComponentFixture<KnowledgebaseDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ KnowledgebaseDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(KnowledgebaseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
