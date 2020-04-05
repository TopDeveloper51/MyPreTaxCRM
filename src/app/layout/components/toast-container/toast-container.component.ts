// External Imports
import { Component, OnInit, OnDestroy } from '@angular/core';

// Internal Imports
import { MessageService } from '@app/shared/services';

@Component({
  selector: 'app-toast-container',
  templateUrl: './toast-container.component.html',
  styleUrls: ['./toast-container.component.scss'],
  host: { '[class.ngb-toasts]': 'true' }
})

export class ToastContainerComponent implements OnInit, OnDestroy {
  public currentToasts: Array<any> = [];
  private toastSubscription: any;

  constructor(private _messageService: MessageService) { }

  /**
   * @param id 
   *      Holds unique number associated with toast.
   * @description
   *      To remove toast when user clicks on close icon.
   */
  public removeToast(id: number): void {
    this._messageService.hideMessage(id);
  }

  ngOnInit() {
    // subscribe toast change.
    this.toastSubscription = this._messageService.toastSubscription.subscribe((toasts: any) => {
      this.currentToasts = toasts;
    })
  }

  ngOnDestroy() {
    this.toastSubscription.unsubscribe();
  }
}
