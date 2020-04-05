import { Component, OnInit, EventEmitter } from '@angular/core';

import { NgForm } from '@angular/forms';
import { MessageService } from '@app/shared/services';
import { environment } from '@environments/environment';
import * as _ from 'lodash';
import { UploadFile, UploadInput, UploadOutput, UploaderOptions } from 'ngx-uploader';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-efin-letter-upload',
    templateUrl: './efin-letter-upload.component.html',
    styleUrls: ['./efin-letter-upload.component.scss']
})
export class EfinLetterUploadComponent implements OnInit {

    //   private locationId: string;
    //   private masterLocationId: string;
    //   public firmName: string;
    //   public efin: string;
    public data: any;

    public isDataLoading: boolean = false;
    public fileSizeMessage: boolean = false;
    public uploadErrMessage: boolean = false;
    public invalidType: boolean = false;

    disableUpload: boolean = false;
    files: UploadFile[];
    uploadInput: EventEmitter<UploadInput>;
    dragOver: boolean;
    options: UploaderOptions = {
        //   allowedContentTypes: ['application/pdf','application/x-pdf','application/acrobat','applications/vnd.pdf','text/pdf','text/x-pdf',
        //   'image/jpeg','image/jpg','image/jp_','application/jpg','application/x-jpg','image/pjpeg','image/pipeg','image/vnd.swiftview-jpeg','image/x-xbitmap','image/jpe_','image/png','application/png','application/x-png'],
        concurrency: 1
    };

    // when user drags a file in upload area
    // public hasBaseDropZoneOver: boolean = false;
    // Configured in ngOnInit, when activity Id to be assigned
    // public options: UploaderOptions;
    // To get progress of uploading
    public progressPercentage: number = 0;

    constructor(public modal: NgbActiveModal, public messageService: MessageService) {
        // Get config data
        this.files = []; // local uploading files array
        this.uploadInput = new EventEmitter<UploadInput>(); // input events, we use this to emit data to ngx-uploader
    }

    onUploadOutput(output: UploadOutput): void {
        console.log("output.type==" + output.type);
        if (output.type === 'allAddedToQueue') { // when all files added in queue
            if (!this.fileSizeMessage && !this.disableUpload) {

                const event: UploadInput = {
                    type: 'uploadFile',
                    file: this.files[0],
                    url: `${environment.origin}/location/efin/uploadLetter`,
                    method: 'POST',
                    data: {
                        upload: JSON.stringify({ 'locationId': this.data.locationID, 'masterLocationId': this.data.masterLocationId,'efin': this.data.efin , 'efinId': this.data.efinId })
                    },
                    headers: {
                        'X-XSRF-TOKEN': JSON.parse(localStorage.getItem('xsrfToken'))
                    },
                    withCredentials: true,
                };
                this.uploadInput.emit(event);
            } else {
                this.uploadInput.emit({ type: 'removeAll' });
            }
        } else if (output.type === 'addedToQueue' && typeof output.file !== 'undefined') { // add file to array when added
            if (output.file.size > 5 * 1024 * 1024) {
                this.fileSizeMessage = true;
                this.invalidType = false;
            } else {
                this.files[0] = output.file;
                this.fileSizeMessage = false;
            }
        } else if (output.type === 'uploading' && typeof output.file !== 'undefined') {
            this.fileSizeMessage = false;
            this.invalidType = false;
            this.disableUpload = true;

            // update current data in files array for uploading file
            const index = this.files.findIndex(file => typeof output.file !== 'undefined' && file.id === output.file.id);
            this.files[index] = output.file;
            this.progressPercentage = output.file.progress.data.percentage;
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
            this.disableUpload = false;
            const result = JSON.parse(JSON.stringify(output.file.response));
            if (result.data === true) {
                this.close(true);
            }
        } else if (output.type === 'rejected') {
            this.fileSizeMessage = false;
            this.invalidType = true;
        }
    }
    // close Dialog
    public close(data: boolean): void {
        this.modal.close(data);
    }

    private cancel(): void {
        this.modal.close(false);
    };

    public ngOnInit(): void {
        //   this.locationId = this.data['locationID'];
        //   this.masterLocationId = this.data['masterLocationId'];
        //   this.firmName = this.data['officeName'];
        //   this.efin = this.data['efin'];      

        // console.log("this.data.locationID" + this.data.locationID);
        // console.log("Data" + JSON.stringify(this.data));
    };
}
