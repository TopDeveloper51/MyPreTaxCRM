import { Directive, ElementRef, Input, NgModule } from '@angular/core';

@Directive({
  selector: '[appAutofocus]'
})
export class AutofocusDirective {

  private focus = true;

  constructor(private el: ElementRef) { }



  /**
   * @author Manali Joshi
   * @createdDate 10/1/2020
   * @param {*}
   * @memberof AutofocusDirective
   */
  ngOnInit() {
    if (this.focus) {
      //Otherwise Angular throws error: Expression has changed after it was checked.
      window.setTimeout(() => {
        this.el.nativeElement.focus();
      });
    }
  }

  @Input('appAutofocus') set autofocus(condition: boolean) {
    this.focus = condition !== false;
  }

}

@NgModule({
  declarations: [AutofocusDirective],
  exports: [AutofocusDirective]
})

export class MyAutoFocusModule { }
