import { Component, OnInit, Input, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { UploadFile, UploadInput, UploadOutput, UploaderOptions } from 'ngx-uploader';
import { DomSanitizer } from '@angular/platform-browser';
import { Subscription } from 'rxjs/Subscription';
import * as _ from 'lodash';

// Internal Imports
import { environment } from '@environments/environment';
import { DialogService, MessageService, CommonApiService, CDRService, LocalStorageUtilityService } from "@app/shared/services";
import { APINAME } from "@app/ticket-activity/ticket-activity.constants";
import { TicketActivityIntegrityService } from '@app/ticket-activity/ticket-activity-integrity.service';


@Component({
  selector: 'mtpo-activity-document-upload',
  templateUrl: './activity-document-upload.component.html',
  styleUrls: ['./activity-document-upload.component.scss']
})
export class ActivityDocumentUploadComponent implements OnInit, OnDestroy {
  @Input() modelData: any = {};
  public activityData: any = { documentList: [] };
  @ViewChild('uploader', { static: false }) uploaderInput: ElementRef;

  public activityMode: string = 'New';
  public tempActivityId: any;
  public isPlay: any = [];
  public isShowAudio: any = [];
  public currentSelRecordingFileIndex = -1;
  public showStop: boolean = false;
  public url: string;
  public isDataLoading: boolean = false;
  public isViewMode: boolean; // for handling view or edit mode when activity open in new tab
  private subscription: Subscription;
  public originalDocumentList: any = [];
  public isEmailIn = false;

  public options: UploaderOptions = {
    concurrency: 1
  };
  public uploadInput: EventEmitter<UploadInput>;
  public files: UploadFile[];
  public disableUpload: boolean = false;
  public fileSizeMessage: boolean = false;
  public progressPercentage: number = 0;// To get progress of uploading
  public dragOver: boolean; // when user drags a file in upload area
  public activityAvailable: boolean = true;


  constructor(
    private sanitizer: DomSanitizer,
    private dialogService: DialogService,
    private cdr: ChangeDetectorRef,
    private CDRService: CDRService,
    private messageService: MessageService,
    private commonApiService: CommonApiService,
    private localStorageUtilityService: LocalStorageUtilityService,
    private ticketActivityIntegrityService: TicketActivityIntegrityService,
  ) {
    this.files = []; // local uploading files array
    this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader

  }


  onUploadOutput(output: UploadOutput): void {
    if (this.uploaderInput !== undefined && this.uploaderInput.nativeElement !== undefined) {
      this.uploaderInput.nativeElement.value = '';
    }
    if (output.type === 'allAddedToQueue') { // when all files added in queue
      if (!this.fileSizeMessage && !this.disableUpload) {
        if (this.activityMode == 'New') {
          const event: UploadInput = {
            type: 'uploadFile',
            file: this.files[0],
            url: `${environment.origin}/activity/upload`,
            method: 'POST',
            data: {
              data: JSON.stringify({ 'tempId': this.tempActivityId, 'mode': this.activityMode })
            },
            headers: {
              'X-XSRF-TOKEN': this.localStorageUtilityService.getFromLocalStorage('xsrfToken'),
              'ngsw-bypass': 'true'
            },
            withCredentials: true,
          };
          this.uploadInput.emit(event);
        } else {
          const event: UploadInput = {
            type: 'uploadFile',
            file: this.files[0],
            url: `${environment.origin}/activity/upload`,
            method: 'POST',
            data: {
              data: JSON.stringify({ 'activityId': 'ACT_' + this.activityData.id, 'mode': this.activityMode })
            },
            headers: {
              'X-XSRF-TOKEN': this.localStorageUtilityService.getFromLocalStorage('xsrfToken'),
              'ngsw-bypass': 'true'
            },
            withCredentials: true,
          };
          this.uploadInput.emit(event);
        }
      } else {
        this.uploadInput.emit({ type: 'removeAll' });
      }
    } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') { // add file to array when added
      if (output.file.size > 15 * 1024 * 1024) {
        this.fileSizeMessage = true;
      } else {
        this.files[0] = output.file;
        this.fileSizeMessage = false;
      }
    } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
      this.fileSizeMessage = false;
      this.disableUpload = true;
      // update current data in files array for uploading file
      const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
      this.files[index] = output.file;
      this.progressPercentage = output.file.progress.data.percentage;
    } else if (output.type === 'start') {
      this.isDataLoading = true;
      this.messageService.showMessage('Document upload in process', 'info');
    } else if (output.type === 'removed') {
      // remove file from array when removed
      this.files = this.files.filter((file: UploadFile) => file !== output.file);
    } else if (output.type === 'dragOver') {
      if (this.disableUpload) {
        this.dragOver = false;
      } else {
        this.dragOver = true;
      }
    } else if (output.type === 'dragOut') {
      this.dragOver = false;
    } else if (output.type === 'drop') {
      this.dragOver = false;
    } else if (output.type === 'done') {
      const document = JSON.parse(JSON.stringify(output.file.response));
      if (document.data !== undefined && document.data !== null && Object.keys(document.data).length > 0) {
        this.activityData.documentList.push(document.data);
        if (this.activityMode == 'New') {
          this.tempActivityId = document.data.tempId;
          this.activityData.tempActivityId = this.tempActivityId;
        }
        this.messageService.showMessage('Document added successfully', 'success');
      } else {
        this.messageService.showMessage('Document upload unsuccessful', 'error');
      }
      this.isDataLoading = false;
      this.disableUpload = false;
    } else if (output.type === 'rejected') {
      this.fileSizeMessage = false;
    }
    this.CDRService.callDetectChanges(this.cdr);
  }




  public getDocument(docId: any, contentType: any, fileName: string): any {
    let url;
    if (this.activityMode == 'New') {
      url = `${environment.origin}/activity/downloadDocument?documentId=` + docId + '&tempActivityId=' + 'ACT_' + this.tempActivityId;
    } else {
      url = `${environment.origin}/activity/downloadDocument?documentId=` + docId + '&activityId=' + this.activityData.ID;
    }
    return this.sanitizer.bypassSecurityTrustUrl(url);
  };

  public deleteDocument(docId: any): void {
    const self = this;
    const dialogData = { title: 'Confirmation', text: 'Are you sure, you want to delete document?' };
    this.dialogService.confirm(dialogData, {}).result.then(
      (response) => {
        if (response === 'YES') {
          self.activityData.documentList.forEach((element, index) => {
            if (element.ID === docId) {
              let apiParams;
              if (self.activityMode == 'New') {
                apiParams = { 'documentId': docId, 'tempActivityId': self.tempActivityId, 'mode': self.activityMode };
              } else {
                apiParams = { 'documentId': docId, 'activityId': self.activityData.ID, 'mode': self.activityMode };
              }
              self.commonApiService.getPromiseResponse({ apiName: APINAME.DELETE_DOCUMENT, parameterObject: apiParams }).then(
                (response) => {
                  self.messageService.showMessage('Document deleted successfully', 'success');
                  self.activityData.documentList.splice(index, 1);
                  self.CDRService.callDetectChanges(self.cdr);
                }, (error) => {
                  console.error(error);
                });
            }
          });
        }
      })
  };

  // function to start the transcription for the recording file (speech to text)
  public requestTranscript(objDoc: any) {
    let paramObj = Object.assign({ documentDetail: objDoc }, { actId: this.activityData.ID });
    delete paramObj.documentDetail.url;
    this.commonApiService.getPromiseResponse({
      apiName: APINAME.REQUEST_TRANSCRIPT, parameterObject: paramObj
    }).then(response => {
      if (response) {
        const self = this;
        self.messageService.showMessage('Requested file transcription started successfully', 'success');
      }
    });
  }

  // function to open trancription as chat in new tab
  public openTranscriptionChat(transcriptionObj) {
    window.open('/#/detail-view/activity/viewtranscription/' + this.activityData.ID + '/' + transcriptionObj.ID, '_blank');
  }

  public play(url: any, i: any): void {
    for (var index in this.activityData.documentList) {
      if (index == i) {
        this.isPlay[index] = true;
        this.isShowAudio[index] = true;
        this.currentSelRecordingFileIndex = i;
      } else {
        this.isPlay[index] = false;
        this.isShowAudio[index] = false;
      }
    }
    this.showStop = false;
    this.isDataLoading = true;
    this.url = url + '&TS=' + (new Date().getTime());
    this.CDRService.callDetectChanges(this.cdr);
  }
  onPlay(): void {
    this.showStop = true;
    this.isDataLoading = false;
    this.CDRService.callDetectChanges(this.cdr);
  }

  onStop(): void {
    let audio: any = document.getElementById("myaudio");
    audio.pause();
    audio.currentTime = 0;
    this.CDRService.callDetectChanges(this.cdr);
  }

  closePlay(i: any): void {
    for (var index in this.activityData.documentList) {
      if (index == i) {
        this.isPlay[index] = false;
        this.isShowAudio[index] = false;
        this.currentSelRecordingFileIndex = i;
      }
    }
  }

  setInitialFlag(): void {
    if (this.activityData.id !== undefined) {
      this.activityMode = 'Edit';
    } else {
      this.activityMode = 'New';
    }
    if (this.activityData.documentList != null && this.activityData.documentList.length > 0) {
      // this.originalDocumentList = JSON.parse(JSON.stringify(this.activityData.documentList));
      for (var i in this.activityData.documentList) {
        this.isPlay[i] = false;
        this.isShowAudio[i] = false;
      }
    }
    else {
      this.activityData.documentList = [];
    }
    this.originalDocumentList = JSON.parse(JSON.stringify(this.activityData.documentList));
  }

  ngOnInit() {
    if (this.modelData && this.modelData.data && this.modelData.data.isEmailIn) {
      this.isEmailIn = true;
    } else {
      this.isEmailIn = false;
    }
    this.subscription = this.ticketActivityIntegrityService.getActivityDetails().subscribe(data => {
      if (data) {
        this.activityData = data;
        this.setInitialFlag();
      }
    });
    this.subscription = this.ticketActivityIntegrityService.getMessage().subscribe(msgObj => {
      if (msgObj.topic === 'isViewMode') {
        this.isViewMode = msgObj.data;
      } else if (this.modelData && msgObj.id == this.modelData.id) {
        if (msgObj.topic == 'save') {
          let hasChanges = !_.isEqual(this.activityData.documentList, this.originalDocumentList);
          this.ticketActivityIntegrityService.sendMessage({ channel: 'documentList', topic: 'saveData', data: { 'isValid': true, 'hasChanges': hasChanges, 'requestType': msgObj.data.type, 'documentList': this.activityData.documentList, 'id': msgObj.data.id ? msgObj.data.id : undefined }, id: this.modelData.id });
        } else if (msgObj.topic === 'noActivityAvailable') {
          this.activityAvailable = false;
        }
      }
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
