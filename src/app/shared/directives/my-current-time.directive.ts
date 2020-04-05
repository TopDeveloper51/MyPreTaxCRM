import { Directive, ElementRef, Input, Output, EventEmitter, NgModule, OnInit, OnDestroy, Renderer2 } from '@angular/core';


@Directive({
  selector: '[appMyCurrentTime]'
})
export class MyCurrentTimeDirective implements OnInit, OnDestroy  {

  @Input('appMyCurrentTime') appMyCurrentTime: number;
  @Output('appMyCurrentTimeChange') appMyCurrentTimeChange: EventEmitter<any> = new EventEmitter<any>();
  public seconds: number;
  public hours: number;
  public minutes: number;
  public currentmilisecond: any;
  public interval: any;
  constructor(private elem: ElementRef, private renderer: Renderer2) { }

  ngOnInit(): void {
      this.interval = setInterval(() => {
          this.IncreamentTimeBySecond();
      }, 1000);
      this.updateValue();
  }

  ngOnDestroy(): void {
      clearInterval(this.interval);
  }


  msToHMS(): any {
      let hh = Math.floor(this.currentmilisecond / (1000 * 60 * 60)) + '';
      if (hh.length < 2) {
          hh = '0' + hh;
      }

      let mm = Math.floor((this.currentmilisecond % (1000 * 60 * 60)) / (1000 * 60)) + '';
      while (mm.length < 2) {
          mm = '0' + mm;
      }

      let ss = Math.floor((this.currentmilisecond % (1000 * 60)) / (1000)) + '';
      while (ss.length < 2) {
          ss = '0' + ss;
      }

      const time = hh + ':' + mm + ':' + ss;
      if (this.hours > 0) {
          this.renderer.setProperty(this.elem.nativeElement, 'innerHTML', time);
      } else {
          this.renderer.setProperty(this.elem.nativeElement, 'innerHTML', time);
      }

  };

  updateValue(): void {
      this.currentmilisecond = this.appMyCurrentTime;
      this.msToHMS();
  };

  IncreamentTimeBySecond(): void {
      this.currentmilisecond += 1000;
      this.appMyCurrentTime = this.currentmilisecond;
      this.appMyCurrentTimeChange.emit(this.appMyCurrentTime);
      this.msToHMS();
  }
}

@NgModule({
  declarations: [MyCurrentTimeDirective],
  exports: [MyCurrentTimeDirective]
})

export class MyCurrentTimeModule { }
