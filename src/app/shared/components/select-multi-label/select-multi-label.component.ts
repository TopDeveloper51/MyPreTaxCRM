// External imports
import {
  Component,
  OnInit,
  Input,
  OnChanges,
  SimpleChanges
} from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-select-multi-label",
  templateUrl: "./select-multi-label.component.html",
  styleUrls: ["./select-multi-label.component.scss"]
})
export class SelectMultiLabelComponent implements OnInit, OnChanges {
  @Input() items;
  @Input() groupItems;
  @Input() lookup;
  @Input() classStyle;
  
  itemsList: any = [];
  groupItemList: any = [];
  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    if (this.items) {
      this.mergeWithComma();
    } else if (this.groupItems) {
      this.mergeGroupItemWithComma();
    }
  }

  mergeWithComma() {
    if (this.items && this.items.length > 0) {
      this.itemsList = Object.keys(this.items)
        .map(i => {
          return this.items[i].name;
        })
        .join(",");
    }
  }

  mergeGroupItemWithComma() {
    if (this.groupItems && this.groupItems.length > 0) {
      let tempGroupItems = [];
      this.groupItems.forEach(element => {
        if (Object.keys(element).length == 1) {
          this.lookup.filter(obj => {
            if (obj.group === element.group) {
              tempGroupItems.push(obj.name);
            }
          });
        }else {
          tempGroupItems.push(element.name);
        }
      });
      this.itemsList = tempGroupItems.join();
    }
  }
}
