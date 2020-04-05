import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-action-not-reached',
  templateUrl: './action-not-reached.component.html',
  styleUrls: ['./action-not-reached.component.scss']
})
export class ActionNotReachedComponent implements OnInit {

  @Output() ruleNameChange = new EventEmitter<any>();
  @Input() rule: string;
  @Input() showFurtherAction: boolean;

  constructor() { }

  public ruleNameChangeEvent(ruleName) {
    this.ruleNameChange.emit(ruleName);
  }

  ngOnInit() {
  }

}
