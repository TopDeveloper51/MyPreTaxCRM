import { Component, Input, OnInit } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpProgressEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { EditorComponent } from '@progress/kendo-angular-editor';
import { ImageInfo } from '@app/ticket-activity/ticket-activity-detail/components/ta-activity/dialogs/image-upload-dialog/image-upload-dialog.component';

@Component({
  selector: 'app-image-dialog',
  templateUrl: './image-dialog.component.html',
  styleUrls: ['./image-dialog.component.scss']
})
export class ImageDialogComponent implements OnInit, HttpInterceptor {
  @Input() public editor: EditorComponent;

  public opened = false;
  public src: string;
  public height: number;
  public width: number;

  constructor() { }

  public get canInsert(): boolean {
    return !this.src;
  }

  public uploadImage(): void {
    // Invoking the insertImage command of the Editor.
    this.editor.exec('insertImage', this.imageInfo);

    // Closing the Dialog.
    this.close();
  }

  public get imageInfo(): ImageInfo {
    return {
      src: this.src,
      height: this.height,
      width: this.width
    };
  }

  public setImageInfo(value: ImageInfo) {
    if (value) {
      this.src = value.src;
      this.height = value.height;
      this.width = value.width;
    } else {
      this.resetData();
    }
  }

  public open(): void {
    this.opened = true;
  }

  public close(): void {
    this.opened = false;
    this.resetData();
  }

 public resetData(): void {
    this.src = null;
    this.width = null;
    this.height = null;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url === 'saveUrl' || req.url === 'removeUrl') {
      return of(new HttpResponse({ status: 200 }));
    }

    return next.handle(req);
  }
  ngOnInit(): void {
  }

}
