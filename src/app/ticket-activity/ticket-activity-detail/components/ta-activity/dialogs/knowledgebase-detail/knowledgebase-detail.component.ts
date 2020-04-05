// Internal imports
import { Component, OnInit, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'mtpo-knowledgebase-detail',
  templateUrl: './knowledgebase-detail.component.html',
  styleUrls: ['./knowledgebase-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class KnowledgebaseComponent implements OnInit {

  public data: any;
  public screen: any;

  constructor(
    public modal: NgbActiveModal,
    private cdr: ChangeDetectorRef) { }

  ngOnInit() {
  }

}
