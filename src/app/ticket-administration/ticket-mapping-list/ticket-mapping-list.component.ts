import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { CdkDragDrop, moveItemInArray, copyArrayItem } from '@angular/cdk/drag-drop';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';

import { MessageService, DialogService, CommonApiService } from '@app/shared/services';
// import { LoaderService } from '../../common/components/loader/loader.service';
import { APINAME, ENUMS } from '@app/ticket-administration/ticket-administration-constants';

@Component({
  selector: 'app-ticket-mapping-list',
  templateUrl: './ticket-mapping-list.component.html',
  styleUrls: ['./ticket-mapping-list.component.scss']
})
export class TicketMappingListComponent implements OnInit {

  validationStatus: number;
  migrationStatus: number;
  csvStatus: number;
  public changesExist: boolean = false;
  public savedNewTicketTypeObject: any = {};
  public availableNewTicketTypeObject: any = {};
  public availableOldTicketTypeObject: any = {};
  public availableNewTicketTypeArray: any = [];
  public availableOldTicketTypeArray: any = [];
  public validationStatusList = ENUMS.validationStatusList;
  public connectionList = [];

  constructor(private commonAPI: CommonApiService, private messageService: MessageService, private dialogService: DialogService,
    private viewContainerRef: ViewContainerRef,
    // private loader: LoaderService
  ) { }


  onDrop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      if (!event.container.sortingDisabled) {
        moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      }
    } else {
      if (event.previousContainer.sortingDisabled && !event.container.sortingDisabled) {
        copyArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);
        let indexofNewTypeForMapping;
        if (event.currentIndex > 0) {
          indexofNewTypeForMapping = -1;
        } else if (event.currentIndex == 0) {
          indexofNewTypeForMapping = 1;
        }

        //for setting up mapping of the old ticket type with the new ticket type object
        let typeId = event.container.data[event.currentIndex + indexofNewTypeForMapping]['typeId'];
        let subTypeId = event.container.data[event.currentIndex + indexofNewTypeForMapping]['subTypeId'];
        let oldTypebj: any = {}
        oldTypebj.oldTypeId = event.container.data[event.currentIndex]['typeId'];
        oldTypebj.oldTypeText = event.container.data[event.currentIndex]['typeText'];
        oldTypebj.oldSubTypeId = event.container.data[event.currentIndex]['subTypeId'];
        oldTypebj.oldSubTypeText = event.container.data[event.currentIndex]['subTypeText'];
        if (this.availableNewTicketTypeObject[typeId].subTypeList[subTypeId].mappingList && this.availableNewTicketTypeObject[typeId].subTypeList[subTypeId].mappingList.length > 0) {
          this.availableNewTicketTypeObject[typeId].subTypeList[subTypeId].mappingList.push(oldTypebj);
        } else {
          this.availableNewTicketTypeObject[typeId].subTypeList[subTypeId].mappingList = [oldTypebj];
        }

        //for setting up mapping of the old ticket type with the new ticket type array
        if (event.container.data[event.currentIndex]) {
          let newTypeObj: any = {}
          newTypeObj.oldSubTypeId = event.container.data[event.currentIndex]['subTypeId'];
          newTypeObj.oldSubTypeText = event.container.data[event.currentIndex]['subTypeText'];
          newTypeObj.oldTypeId = event.container.data[event.currentIndex]['typeId'];
          newTypeObj.oldTypeText = event.container.data[event.currentIndex]['typeText'];
          newTypeObj.subTypeId = event.container.data[event.currentIndex + indexofNewTypeForMapping]['subTypeId'];
          newTypeObj.subTypeText = event.container.data[event.currentIndex + indexofNewTypeForMapping]['subTypeText'];
          newTypeObj.typeId = event.container.data[event.currentIndex + indexofNewTypeForMapping]['typeId'];
          newTypeObj.typeText = event.container.data[event.currentIndex + indexofNewTypeForMapping]['typeText'];

          if (event.container.data[event.currentIndex + indexofNewTypeForMapping]['oldTypeText']) {
            event.container.data[event.currentIndex] = newTypeObj;
          } else {
            let newTypeExists = this.availableNewTicketTypeArray.findIndex((t) => t.typeId == typeId)
            let newSubTypeExists = this.availableNewTicketTypeArray[newTypeExists].subTypeListArray.findIndex((t) => t.subTypeId == subTypeId)
            this.availableNewTicketTypeArray[newTypeExists].subTypeListArray[newSubTypeExists] = newTypeObj;
            this.availableNewTicketTypeArray[newTypeExists].subTypeListArray.splice(event.currentIndex, 1);
          }
        }

        //to enable or disable buttons when there are changes in new ticket type data
        if (!_.isEqual(JSON.stringify(this.savedNewTicketTypeObject), JSON.stringify(this.availableNewTicketTypeObject))) {
          this.changesExist = true;
        } else {
          this.changesExist = false;
        }
      }
    }
  }

  unmapType(data) {
    //for unmapping of the old ticket type with the new ticket type object
    if (this.availableNewTicketTypeObject[data.typeId].subTypeList[data.subTypeId].mappingList && this.availableNewTicketTypeObject[data.typeId].subTypeList[data.subTypeId].mappingList.length > 0) {
      let indexToSplice = this.availableNewTicketTypeObject[data.typeId].subTypeList[data.subTypeId].mappingList.findIndex((t) => t.oldTypeId == data.oldTypeId && t.oldSubTypeId == data.oldSubTypeId)
      if (indexToSplice > -1) {
        this.availableNewTicketTypeObject[data.typeId].subTypeList[data.subTypeId].mappingList.splice(indexToSplice, 1);
      }
    }

    //for unmapping of the old ticket type with the new ticket type array
    let typeIndexToSplice = this.availableNewTicketTypeArray.findIndex((t) => t.typeId == data.typeId)
    if (typeIndexToSplice > -1) {
      let subTypeIndexToSplice = this.availableNewTicketTypeArray[typeIndexToSplice].subTypeListArray.findIndex((t) => t.subTypeId == data.subTypeId && t.oldTypeId == data.oldTypeId && t.oldSubTypeId == data.oldSubTypeId)
      let objWithoutMapping: any = this.availableNewTicketTypeArray[typeIndexToSplice].subTypeListArray[subTypeIndexToSplice];
      delete objWithoutMapping.oldTypeId
      delete objWithoutMapping.oldTypeText
      delete objWithoutMapping.oldSubTypeId
      delete objWithoutMapping.oldSubTypeText
      delete objWithoutMapping.status
      this.availableNewTicketTypeArray[typeIndexToSplice].subTypeListArray.splice(subTypeIndexToSplice, 1)
      if (subTypeIndexToSplice > -1) {
        let moreSimilarSubTypeExists = this.availableNewTicketTypeArray[typeIndexToSplice].subTypeListArray.findIndex((t) => t.subTypeId == data.subTypeId && t.oldTypeId && t.oldSubTypeId)
        if (moreSimilarSubTypeExists == -1) {
          this.availableNewTicketTypeArray[typeIndexToSplice].subTypeListArray.push(objWithoutMapping)
        }
      }
    }

    //to disable buttons when there are changes in new ticket type data
    if (!_.isEqual(JSON.stringify(this.savedNewTicketTypeObject), JSON.stringify(this.availableNewTicketTypeObject))) {
      this.changesExist = true;
    } else {
      this.changesExist = false;
    }
  }

  getAllTicketData() {
    this.commonAPI.getPromiseResponse({ apiName: APINAME.GET_TICKET_MAPPING_LIST, parameterObject: {} }).then(response => {
      this.validationStatus = response.validationStatus;
      this.migrationStatus = response.migrationStatus;
      this.csvStatus = response.csvStatus;
      this.availableNewTicketTypeObject = {};
      this.availableOldTicketTypeObject = {};
      this.availableNewTicketTypeArray = [];
      this.availableOldTicketTypeArray = [];
      this.connectionList = [];
      if (response) {

        //maintaining new and old type objects for saving purpose
        this.availableNewTicketTypeObject = JSON.parse(JSON.stringify(response.newType));
        this.availableOldTicketTypeObject = JSON.parse(JSON.stringify(response.oldType));
        this.savedNewTicketTypeObject = JSON.parse(JSON.stringify(response.newType));
        this.changesExist = false;

        //setting up array for display of old Ticket types
        for (let obj in response.oldType) {
          if (response.oldType[obj].subTypeList) {
            response.oldType[obj].subTypeList = Object.entries(response.oldType[obj].subTypeList).map((e) => (e[1]));
            response.oldType[obj].subTypeList.forEach(function (element) {
              element.typeText = response.oldType[obj].typeText;
              element.typeId = response.oldType[obj].typeId;
            });
          }
          this.availableOldTicketTypeArray.push(response.oldType[obj]);
        }

        //setting up array for display of new Ticket types
        for (let obj in response.newType) {
          if (response.newType[obj].subTypeList) {
            response.newType[obj].subTypeList = Object.entries(response.newType[obj].subTypeList).map((e) => (e[1]));
            response.newType[obj].subTypeList.forEach(function (element) {
              element.typeText = response.newType[obj].typeText;
              element.typeId = response.newType[obj].typeId;
            });
            response.newType[obj].subTypeListArray = [];
            for (let sub of response.newType[obj].subTypeList) {
              if (sub.mappingList && sub.mappingList.length > 0) {
                sub.mappingList.forEach(function (element) {
                  element.typeText = sub.typeText;
                  element.typeId = sub.typeId;
                  element.subTypeText = sub.subTypeText;
                  element.subTypeId = sub.subTypeId;
                  if (element.warning && element.warning.length > 0) {
                    element.warnings = element.warning.join(', \n')
                  }
                });
                let objArray;
                objArray = Object.entries(sub.mappingList).map((e) => (e[1]));
                if (response.newType[obj].subTypeListArray && response.newType[obj].subTypeListArray.length > 0) {
                  response.newType[obj].subTypeListArray = response.newType[obj].subTypeListArray.concat(objArray);
                } else {
                  response.newType[obj].subTypeListArray = objArray
                }
              } else {
                response.newType[obj].subTypeListArray.push(sub);
              }
            }
          }
          this.connectionList.push('newTypeList' + obj);
          this.availableNewTicketTypeArray.push(response.newType[obj]);
        }
      }
    }, error => {
      console.error(error);
    });
  }

  saveMapping() {
    const dialogData = { title: 'Confirmation', text: 'Are you sure, you want to save the mapping for the new Ticket Types?' };
    this.dialogService.confirm(dialogData, {}).result.then((response) => {
      if (response == 'YES') {
        this.commonAPI.getPromiseResponse({ apiName: APINAME.SAVE_TICKET_MAPPING_LIST, parameterObject: this.availableNewTicketTypeObject }).then(res => {
          if (res === true) {
            this.messageService.showMessage('Ticket Types mapped successfully', 'success');
            this.getAllTicketData()
          } else {
            this.messageService.showMessage('Ticket Type mapping unsuccessful', 'error');
          }
        }, error => {
          this.messageService.showMessage('Ticket Type mapping unsuccessful', 'error');
          console.error(error);
        });
      }
    }, (error) => {
      console.error(error);
    });

  }

  validateMapping() {
    const dialogData = { title: 'Confirmation', text: 'Are you sure, you want to validate the mapping for the new Ticket Type?' };
    this.dialogService.confirm(dialogData, {}).result.then((response) => {
      if (response) {
        if (this.validationStatus == 3) {
          this.messageService.showMessage('Ticket Types already validated successfully', 'info');
        } else {
          this.validationStatus = 1;
          this.commonAPI.getPromiseResponse({ apiName: APINAME.SAVE_VALIDATE_TICKET_MAPPING_LIST, parameterObject: this.availableNewTicketTypeObject }).then(res => {
            if (res === true) {
              this.messageService.showMessage('Ticket Types mapped successfully', 'success');
            } else {
              this.messageService.showMessage('Ticket Type mapping unsuccessful', 'error');
            }
            this.getAllTicketData();
          }, error => {
            this.messageService.showMessage('Ticket Type mapping unsuccessful', 'error');
            console.error(error);
          });
        }
      }
    });
  }

  startMigration() { }

  stopMigration() { }

  cleanIndex() {
    const dialogData = { title: 'Confirmation', text: 'Are you sure, you want to clean the Ticket index?' };
    this.dialogService.confirm(dialogData, {}).result.then((response) => {
      if (response == 'YES') {
        this.commonAPI.getPromiseResponse({ apiName: APINAME.CLEAN_INDEX, parameterObject: {} }).then(res => {
          if (res === true) {
            this.messageService.showMessage('Index cleaned Successfully', 'success');
          } else {
            this.messageService.showMessage('Index cleaning unsuccessful', 'error');
          }
        }, error => {
          this.messageService.showMessage('Index cleaning unsuccessful', 'error');
          console.error(error);
        });
      }

    });
  }

  createReport() {
    this.csvStatus = 1;
    this.commonAPI.getPromiseResponse({ apiName: APINAME.CREATE_REPORT, parameterObject: {} }).then(response => {
    }, error => {
      console.error(error);
    });
  };

  downloadReport() {
    // this.loader.show();
    this.commonAPI.getObservableResponse({ apiName: APINAME.DOWNLOAD_REPORT, parameterObject: {} }).subscribe(result => {
      if (result && result.data) {
        var byteArray = new Uint8Array(result.data);
        var contentType = 'application/vnd.ms-excel';
        var blob = new Blob([byteArray], { type: contentType });
        var a = window.document.createElement('a');
        a.href = window.URL.createObjectURL(blob);
        a.download = "TicketsMapped_" + moment().format('DDMMYYYY_HHmmss') + ".xlsx";
        // Append anchor to body.
        document.body.appendChild(a)
        a.click();
        // this.loader.hide();
      } else {
        this.messageService.showMessage('No Record Found', 'info');
        // this.loader.hide();
      }
    });

  }

  ngOnInit() {
    this.getAllTicketData();
  }

}
