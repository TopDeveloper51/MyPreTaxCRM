import { Component, OnInit } from '@angular/core';
import { EditExpertiseService } from '@app/assessment/dialogs/edit-expertise/edit-expertise.service';
import { FormGroup, FormBuilder } from "@angular/forms";
import { UserService, MessageService } from '@app/shared/services';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';

@Component({
  selector: 'app-edit-expertise',
  templateUrl: './edit-expertise.component.html',
  styleUrls: ['./edit-expertise.component.scss']
})
export class EditExpertiseComponent implements OnInit {

  public userLookupData = [];
  public UserExpertiseForm: FormGroup;
  public userDetails: any;
  public treeViewData: any[] = [];
  public levelDropdownData = [
    { id: 0, name: "None" },
    { id: 1, name: "Aware" },
    { id: 2, name: "Beginner" },
    { id: 3, name: "Intermediate" },
    { id: 4, name: "Expert" }
  ];
  public masterData;
  public expertiseData: any = [];
  public userData: any = {};
  public data: any;
  public user:any;
  constructor(private editexpertiseService: EditExpertiseService, private fb: FormBuilder, private userService: UserService,
    private modal: NgbActiveModal, private messageService: MessageService) { }

  /**
   * @author shreya kanani
   * @description get lookup data for dropdown
   * @createdDate 01/02/2020
   */
  public getLookupForUser() {
    this.editexpertiseService.getUserList().then((response: any) => {
      this.userLookupData = response;
    });
  }
  public getMasterData() {
    this.editexpertiseService.getMasterData().then((response: any) => {
      this.masterData = response;
      this.processTreeViewData();
      this.getLookupForUser();
    }, error => {
      this.messageService.showMessage('Error ocurred while fetching user category master data.', 'error');
    });
  }

  /**
   * @author shreya kanani
   * @description this method call when checkbox checked
   * @createdDate 01/02/2020
   */ 
  isSelectedData(dataItem, option) {
    for (let i = 0; i < dataItem.lookup.length; i++) {
      if (option.id == dataItem.lookup[i].id && option.isSelected == true) {
        dataItem.level = dataItem.lookup[i].id;
        this.levelSelected(dataItem);
        dataItem.lookup[i].isSelected = true;
      } else {
        dataItem.lookup[i].isSelected = false;
      }
    }
  }

  levelSelected(dataItem) {
    let item = JSON.parse(JSON.stringify(dataItem));
    delete item.text;
    delete item.lookup;
    if (this.expertiseData.length <= 0) {
      this.expertiseData.push(item);
    } else {
      var alreadyExists = false;
      for (let obj of this.expertiseData) {
        if (item.type == "category" && item.categoryId == obj.categoryId) {
          obj.level = item.level;
          alreadyExists = true;
        } else if (item.type == "course" && item.categoryId == obj.categoryId && item.courseId == obj.courseId) {
          obj.level = item.level;
          alreadyExists = true;
        } else if (item.type == "module" && item.categoryId == obj.categoryId && item.courseId == obj.courseId && item.moduleId == obj.moduleId) {
          obj.level = item.level;
          alreadyExists = true;
        }
      }
      if (alreadyExists == false) {
        this.expertiseData.push(item);
      }
    }
  }

  /**
   * @author shreya kanani
   * @description this method process treeview data
   * @createdDate 01/02/2020
   */
  processTreeViewData() {
    this.treeViewData = [];
    try {
      for (let category of this.masterData.categories) {
        var categoryObj: any = { 'text': category.name, "categoryId": category.id, 'type': 'category' };
        if (category.courses && category.courses.length > 0) {
          for (let course of category.courses) {
            var coursex = this.masterData.courses.find((coursea) => { return coursea.id === course });
            if (coursex) {
              var courseObj: any = { 'text': coursex.name, "courseId": coursex.id, "categoryId": category.id, 'type': 'course' };
              if (coursex.modules && coursex.modules.length > 0) {
                for (let modules of coursex.modules) {
                  var modulex = this.masterData.modules.find((modulea) => { return modulea.id === modules });
                  if (modulex) {
                    var moduleObj = { "text": modulex.name, "moduleId": modulex.id, 'type': 'module', "categoryId": category.id, "courseId": coursex.id };
                    if (this.expertiseData && this.expertiseData.length > 0) {
                      moduleObj["level"] = this.mapLevelToData("module", category.id, coursex.id, modulex.id);
                    }
                    if (!courseObj["items"]) {
                      courseObj["items"] = [];
                    }
                    courseObj["items"].push(moduleObj);
                  }
                }
              } else {
                if (this.expertiseData && this.expertiseData.length > 0) {
                  courseObj["level"] = this.mapLevelToData("course", category.id, coursex.id);
                }
              }
              if (!categoryObj["items"]) {
                categoryObj["items"] = [];
              }
              categoryObj["items"].push(courseObj);
            }
          }
          this.treeViewData.push(categoryObj);
        } else {
          if (this.expertiseData && this.expertiseData.length > 0) {
            categoryObj["level"] = this.mapLevelToData("category", category.id);
          }
        }
      }
    } catch (ex) {
      console.log(ex);
    }
    for (let categoryObj of this.treeViewData) {
      if (categoryObj.items && categoryObj.items.length > 0) {
        for (let itemCourese of categoryObj.items) {
          if (itemCourese.items && itemCourese.items.length > 0) {
            for (let itemModule of itemCourese.items) {
              itemModule.lookup = JSON.parse(JSON.stringify(this.levelDropdownData));
              if (itemModule.level != undefined) {
              //  let levelObj = itemModule.find((obj) => { return obj.id = itemModule.level })
                 let levelObj = _.find(itemModule.lookup, { "id": itemModule.level });
                if (levelObj) {
                  levelObj.isSelected = true;
                }
              } else {
                itemModule.lookup[0].isSelected = true
              }
            }
          } else {
            itemCourese.lookup = JSON.parse(JSON.stringify(this.levelDropdownData));
            if (itemCourese.level != undefined) {
              //let levelObj = itemCourese.find((obj) => { return obj.id = itemCourese.level })
               let levelObj = _.find(itemCourese.lookup, { "id": itemCourese.level });
              if (levelObj) {
                levelObj.isSelected = true;
              }
            } else {
              itemCourese.lookup[0].isSelected = true
            }
          }
        }
      } else {
        categoryObj.lookup = JSON.parse(JSON.stringify(this.levelDropdownData));
        if (categoryObj.level != undefined) {
         // let levelObj = categoryObj.find((obj) => { return obj.id = categoryObj.level })
           let levelObj = _.find(categoryObj.lookup, { "id": categoryObj.level });
          if (levelObj) {
            levelObj.isSelected = true;
          }
        } else {
          categoryObj.lookup[0].isSelected = true
        }
      }
    }
  }
  
  mapLevelToData(type: string, categoryId?: any, courseId?: any, moduleId?: any) {
    var level = undefined;
    var levelData;
    if (type === "category") {
      levelData = this.expertiseData.find((obj) => {
        return obj.type == "category" && obj.categoryId == categoryId;
      })
    } else if (type === "course") {
      levelData = this.expertiseData.find((obj) => {
        return obj.type == "course" && obj.categoryId == categoryId && obj.courseId === courseId;
      })
    } else if (type === "module") {
      levelData = this.expertiseData.find((obj) => {
        return obj.type == "module" && obj.categoryId == categoryId && obj.courseId === courseId && obj.moduleId === moduleId;
      })
    }
    if (levelData) {
      level = levelData.level;
    }
    return level;
  }

  /**
   * @author shreya kanani
   * @description this method save dialog data
   * @createdDate 01/02/2020
   */
  public save() {
    this.modal.close(this.expertiseData);
  }
  /**
   * @author shreya kanani
   * @description this method close dialog
   * @createdDate 01/02/2020
   */
  public close() {
    this.modal.close();
  }

  ngOnInit() {
    this.user = this.data;
    this.userDetails = this.userService.getUserDetail();
    this.getLookupForUser();
    if (this.data.userName) {
      this.userData.userId = this.data.id;
    }
    if (this.user.expertiseDetail) {
      this.expertiseData = this.user.expertiseDetail;
    }
    this.getMasterData();
  }
}
