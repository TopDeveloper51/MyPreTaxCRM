import { AfterViewInit, Component, ViewChild, ViewContainerRef, ElementRef } from "@angular/core";
import { ICellEditorAngularComp } from "ag-grid-angular";

@Component({
    selector: 'editor-cell',
    template: `
    <div  #container class="mood" tabindex="0" (keydown)="onKeyDown($event)">
<input style="text-align: center;" type="checkbox" name="required" id="required" [(ngModel)]="checked" (click)="onCheckboxClick()">
</div>
    `,
    styles: [`
        .mood {
            padding: 5px;
            text-align: center;
            padding-left: 47px;
            width: 25px; 
            height: 25px; 
        }
    `]
})

export class CheckBoxEditor implements ICellEditorAngularComp, AfterViewInit {
    private params: any;

    @ViewChild("container", { static: true }) public container;
    public checked: boolean = false;


    // dont use afterGuiAttached for post gui events - hook into ngAfterViewInit instead for this
    ngAfterViewInit() {
        window.setTimeout(() => {
            this.container.nativeElement.focus();
        })
    }

    agInit(params: any): void {
        this.params = params;
        this.setCheckBoxValue(params.value);
    }

    getValue(): any {
        return this.checked;
    }

    isPopup(): boolean {
        return false;
    }

    setCheckBoxValue(checked: boolean): void {
        this.checked = checked;
    }

    toggleMood(): void {
        this.setCheckBoxValue(!this.checked);
    }

    onCheckboxClick() {
        this.setCheckBoxValue(!this.checked);
        // this.params.api.stopEditing();
    }

    onKeyDown(event): void {
        let key = event.which || event.keyCode;
        if (key == 37 ||  // left
            key == 39) {  // right
            this.toggleMood();
            event.stopPropagation();
        }
    }
}
