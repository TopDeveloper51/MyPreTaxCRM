import { Component, OnInit, EventEmitter, Output, Input, SimpleChange } from '@angular/core';

@Component({
  selector: 'app-action-reached',
  templateUrl: './action-reached.component.html',
  styleUrls: ['./action-reached.component.scss']
})
export class ActionReachedComponent implements OnInit {

  @Output() ruleNameChange = new EventEmitter<any>();
  @Input() rule: string;
  @Input() configureOutCome: string;
  @Input() showFurtherAction: boolean;

  public configure = ["DML_TAXVISION_", "DML_SETUP_", "DML_RENEWAL_NEVER_USED_", "DML_RENEWAL_USED_US_", "DML_RENEWAL_"];
  public disabledOutcome = false;
  constructor() { }

  public ruleNameChangeEvent(ruleName) {
    this.ruleNameChange.emit(ruleName);
  }

  checkOutcome() {
    const self = this;
    let isExists = self.configure.filter(key => (self.configureOutCome.indexOf(key) !== -1));
    if (isExists && isExists.length > 0) {
      self.disabledOutcome = true;
    } else {
      self.disabledOutcome = false;
    }
  }

  ngOnInit() {
    this.checkOutcome();
  }

  ngOnChanges(changes: SimpleChange) {
    this.checkOutcome();
  }
}
