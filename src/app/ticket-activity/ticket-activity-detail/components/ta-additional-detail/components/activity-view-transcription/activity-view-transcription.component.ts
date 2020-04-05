// External Imports
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router'

// Internal Imports
import { MessageService, CommonApiService} from "@app/shared/services";
import { LoaderService } from '@app/shared/loader/loader.service';
import { APINAME } from "@app/ticket-activity/ticket-activity.constants";

@Component({
  selector: 'mtpo-activity-view-transcription',
  templateUrl: './activity-view-transcription.component.html',
  styleUrls: ['./activity-view-transcription.component.scss']
})
export class ActivityViewTranscriptionComponent implements OnInit {

  public fileID: any;
  public activityID: any;
  public chatAsArray = [];

  constructor(
    private route: ActivatedRoute,
    private messageService: MessageService,
    private commonAPIService: CommonApiService,
    private loader: LoaderService,
  ) { }


  // This Function help us to Open activity in new tab
  public goToActivity() {
    window.open('/#/detail-view/activity/edit/' + this.activityID, '_blank');
  }

  // This Function help us to get transcription as chat
  public getViewTranscription() {
    this.loader.show();
    this.commonAPIService.getPromiseResponse({ apiName: APINAME.CHAT_DOCUMENT, parameterObject: { docId: this.fileID }, showLoading: false }).then(
      (response) => {
        this.loader.hide();
        this.chatAsArray = response;
      }, (error) => {
        this.loader.hide();
        console.error(error);
        this.messageService.showMessage('Error while getting your requested file transcription', 'error');
      });
  }

  ngOnInit() {
    this.fileID = this.route.snapshot.params['fileId'];
    this.activityID = this.route.snapshot.params['id'];
    this.getViewTranscription();
  }

}
