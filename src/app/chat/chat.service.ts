import { Injectable } from '@angular/core';

@Injectable()
export class ChatService {
  private defaultColDef = {
    enableValue: true,
    enableRowGroup: true,
    enablePivot: true,
    sortable: true,
    resizable: true,
    suppressMaxRenderedRowRestriction: true,
    suppressColumnVirtualisation: true,
    enableBrowserTooltips: true,
    suppressHorizontalScroll: true
  };

  private historyColumnDefs = [
    { headerName: 'Status', field: 'status', suppressMovable: true, suppressMenu: true, sort: "desc", width: 100, suppressSizeToFit: true, },
    { headerName: 'Department', field: 'queueType', suppressMovable: true, suppressMenu: true, width: 120, suppressSizeToFit: true, },
    { headerName: 'In/Out', field: 'direction', suppressMovable: true, suppressMenu: true, width: 100, suppressSizeToFit: true, },
    { headerName: 'Phone/Email/Customer Number', field: 'custInfo', suppressMovable: true, suppressMenu: true, },
    { headerName: 'Agent (active)', field: 'agentName', suppressMovable: true, suppressMenu: true, tooltipField: "agentName" },
    { headerName: 'Wait duration', field: 'waitDuration', suppressMovable: true, suppressMenu: true, width: 150, suppressSizeToFit: true, },
    { headerName: 'Active duration', field: 'activeDuration', suppressMovable: true, suppressMenu: true, width: 150, suppressSizeToFit: true, },
    {
      headerName: 'Action', suppressMovable: true, suppressMenu: true, width: 110, suppressSizeToFit: true,
      cellRenderer: (param) => {
        if (param.data.status == "wait") {
          return `<button type="button" data-activityId=${param.data.activityId} data-action-type='accept' data-chatId='${param.data.chatId}' class="btn btn-success btn-sm">Accept</button>`
        }
        else if (param.data.status == "active") {
          return `<button type="button" data-activityId=${param.data.activityId}  data-action-type='open' data-chatId='${param.data.chatId}' class="btn btn-success btn-sm">Open Chat</button>`
        }
      }
    },
    {
      headerName: '', suppressMovable: true, suppressMenu: true, width: 70, suppressSizeToFit: true,
      cellRenderer: (param) => {
        if (param.data.status) {
          return `<i title="Message Information"  data-action-type='message' data-activityId=${param.data.activityId} class="fa fa-info-circle cursor-pointer font-16 mt-2" aria-hidden="true"></i>`;
        }
      }
    }
  ];

  constructor() { }

  /** Get chat history column  */
  public getChatHitoryColumnDefs() {
    return this.historyColumnDefs;
  }


  /** Get default col def */
  public getDefaultColDef() {
    return this.defaultColDef;
  }
}
