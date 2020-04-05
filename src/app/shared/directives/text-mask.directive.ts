import { Directive, ElementRef, forwardRef, Input, NgModule, OnChanges, OnInit, OnDestroy, Provider, SimpleChanges, HostListener, Output, EventEmitter, Renderer2, } from "@angular/core";
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from "@angular/forms";
import { createTextMaskInputElement } from "text-mask-core/dist/textMaskCore";

export const MASKEDINPUT_VALUE_ACCESSOR: Provider = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => MaskedInputDirective),
  multi: true
};

@Directive({
  selector: "[appTextMask]",
  providers: [MASKEDINPUT_VALUE_ACCESSOR]
})
export class MaskedInputDirective implements ControlValueAccessor, OnChanges {
  private textMaskInputElement: any;
  private inputElement: any;
  private totalDigit: number = 0;
  // stores the last value for comparison
  private lastValue: any;
  private linkOptions: any = {
    maskDefinitions: {
      "9": /\d/,
      A: /[a-zA-Z]/,
      "*": /[a-zA-Z0-9]/
    }
  };

  @Input("appTextMask")
  appTextMask: any = {
    mask: [],
    guide: true,
    placeholderChar: "_",
    pipe: undefined,
    keepCharPositions: false
  };

  @HostListener("blur")
  _onTouched = () => {};
  _onChange = (_: any) => {};

  constructor(
    private renderer2: Renderer2,
    private element: ElementRef,
  ) {
  }

  ngOnChanges(changes: SimpleChanges): any {
    this.setupMask();
    if (this.textMaskInputElement !== undefined) {
      this.textMaskInputElement.update(this.inputElement.value);
    }
  }
  // onBlurMethod For set Blank value if user not write all Digit Of Regex
  @HostListener("blur")
  onBlurMethod(): void {
    const CurrentValue = this.inputElement.value.match(/\d/g);
    if (
      CurrentValue === undefined ||
      CurrentValue === null ||
      CurrentValue.length < this.totalDigit
    ) {
      // this.renderer2.setAttribute(this.inputElement, "value", "");
      this.textMaskInputElement.update('');
    }
  }
  // set masking on Fields
  writeValue(value: any): void {
    if (!this.inputElement) {
      this.setupMask();
    }

    // set the initial value for cases where the mask is disabled
    const normalizedValue = value == null ? "" : value;
    this.renderer2.setAttribute(this.inputElement, "value", normalizedValue);

    if (this.textMaskInputElement !== undefined) {
      this.textMaskInputElement.update(value);
    }
  }

  registerOnChange(fn: (value: any) => any): void {
    this._onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this._onTouched = fn;
  }

  setDisabledState(isDisabled: any): void {
    this.renderer2.setAttribute(
      this.element.nativeElement,
      "disabled",
      isDisabled
    );
  }
  @HostListener("input", ['$event'])
  onInput(value: any): void {
    if (!this.inputElement) {
      this.setupMask();
    }

    if (this.textMaskInputElement !== undefined) {
      this.textMaskInputElement.update(this.inputElement.value);
      // get the updated value
      value = this.inputElement.value;
      const totalValue = value.match(/\d/g);
      // check against the last value to prevent firing ngModelChange despite no changes
      if (
        this.lastValue !== value &&
        totalValue !== undefined &&
        totalValue !== null &&
        totalValue.length === this.totalDigit
      ) {
        this.lastValue = value;
        this._onChange(value);
      } else if (this.lastValue !== value) {
        this.lastValue = undefined;
        this._onChange(undefined);
      }
    }
  }
  // set Mask
  private setupMask(): void {
    if (this.element.nativeElement.tagName === "INPUT") {
      // `textMask` directive is used directly on an input element
      this.inputElement = this.element.nativeElement;
    } else {
      // `textMask` directive is used on an abstracted input element, `ion-input`, `md-input`, etc
      this.inputElement = this.element.nativeElement.getElementsByTagName(
        "INPUT"
      )[0];
    }
    const maskPatterns: any = [];
    this.totalDigit = 0;
    // get Total Digit and Convert into Regex
    for (let i = 0; i < this.appTextMask.mask.length; i++) {
      if (
        this.linkOptions.maskDefinitions[this.appTextMask.mask[i]] !== undefined
      ) {
        maskPatterns.push(
          this.linkOptions.maskDefinitions[this.appTextMask.mask[i]]
        );
        this.totalDigit++;
      } else {
        maskPatterns.push(this.appTextMask.mask[i]);
      }
    }
    this.appTextMask.mask = maskPatterns;
    if (this.inputElement) {
      this.textMaskInputElement = createTextMaskInputElement(
        Object.assign({ inputElement: this.inputElement }, this.appTextMask)
      );
    }
  }
}

@NgModule({
  declarations: [MaskedInputDirective],
  exports: [MaskedInputDirective]
})
export class TextMaskModule {}