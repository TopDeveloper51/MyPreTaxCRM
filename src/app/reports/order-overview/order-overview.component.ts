import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { OrderOverviewService } from './order-overview.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService, PostalChannelService } from '@app/shared/services';
import * as moment from 'moment-timezone';
import * as _ from 'lodash';
import { NgSelectComponent } from '@ng-select/ng-select';

@Component({
  selector: 'app-order-overview',
  templateUrl: './order-overview.component.html',
  styleUrls: ['./order-overview.component.scss'],
  providers: [OrderOverviewService],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class OrderOverviewComponent implements OnInit, OnDestroy {
  public orderLookupObj: any = {};
  public categories: any = [];
  public yy: any;
  public mm: any;
  public years: any = [];
  public orderOverviewForm: FormGroup;
  public view = '';
  public showInfo = false;
  public isShowDraw: boolean;
  public sortList = [{ id: 'Sales', name: 'Sales' }, { id: 'Category', name: 'Classification' }];
  public months = [
    { id: '01', name: 'Jan' },
    { id: '02', name: 'Feb' },
    { id: '03', name: 'Mar' },
    { id: '04', name: 'Apr' },
    { id: '05', name: 'May' },
    { id: '06', name: 'Jun' },
    { id: '07', name: 'Jul' },
    { id: '08', name: 'Aug' },
    { id: '09', name: 'Sep' },
    { id: '10', name: 'Oct' },
    { id: '11', name: 'Nov' },
    { id: '12', name: 'Dec' }
  ];
  private preserveResponsiblePersonList: any = [];
  public viewList: any = [
    { id: 'responsible', name: 'By Agent' },
    { id: 'timeLine', name: 'TimeLine' }
  ];
  public timeLineList: any = [
    // { id: 'day', name: 'Day-wise' },
    { id: 'week', name: 'Week-wise' },
    { id: 'month', name: 'Month-wise' }
  ];
  public options: any = {
    data: [],
    chart: {
      chartType: "stackedColumn",
      chartProperty: [{
        barColor: "#AAE2AA",//color field like 'red' or '#ff0000'
        YpropertyName: "orderPrice"
      },
      {
        barColor: "#95CEF3",
        YpropertyName: "refundPrice"// name of class or json key
      }],
      IndicatorsLines: [0, 3000, 5000, 8000]
    },
    classification: [{
      type: "expert",
      color: "#0000FF"
    }, {
      type: "professional",
      color: "#000000"
    }, {
      type: "trainee",
      color: "#009900"
    }],
    MinRange: -7000,
    MaxRange: 18000,
    gap: 2000,
    XLineValues: [{
      field: "repName", labels: {
        Color: "#000"
      }
    },
    {
      field: "joiningDate", labels: {
        Color: "#000"
      }
    }],
    canvasHeight: 600,
    Color: "#000",
    lineColor: "#000"
  };
  public graphData: any;
  constructor(private orderOverviewService: OrderOverviewService, private fb: FormBuilder, private messageService: MessageService, private cdr: ChangeDetectorRef, private postalChannelService: PostalChannelService) { }

  getLookupForOrderSearch(): void {
    this.orderOverviewService.getLookupForOrderSearch().then((response: any) => {
      // this.orderLookupObj = response;
      this.orderLookupObj = response;
      const responsiblePersonResult = [];
      for (const objV of response.responsiblePesronList) {
        if (objV.group.toLowerCase() === 'sales - atlanta' || objV.group.toLowerCase() === 'sales - rome') {
          // don't set default if users are Robert or Maurice
          if (objV.id !== '3d644a72-42fc-4cc5-a0cf-ed77db15b09e' && objV.id !== '1c4ada05-fec3-4886-b370-d12412a58d09') {
            responsiblePersonResult.push(objV.id);
          }
        }
      }
      this.orderOverviewForm.controls.responsiblePersonResult.setValue(JSON.parse(JSON.stringify(responsiblePersonResult)));
      this.preserveResponsiblePersonList = response.responsiblePesronList;
      this.orderOverviewForm.controls.saleType.setValue(undefined);
      this.orderOverviewGraph();
      this.cdr.detectChanges();
    }, (error) => {
      console.log(error);
    });
  }

  /**
   * @author om kanada
   * @description function call to select all val from lookup
   * @param {string} multipleSelectfor
   *               holds value  holds lookup selected name
   * @memberof OrderOverviewComponent
   */
  public onSelectAll(multipleSelectfor): void {
    let selected;
    switch (multipleSelectfor) {
      case 'responsiblePersonResult':
        selected = [];
        selected = this.orderLookupObj.responsiblePesronList.map(
          item => item.id
        );
        this.orderOverviewForm.get('responsiblePersonResult').patchValue(selected);
        break;

      case 'saleType':
        selected = [];
        selected = this.orderLookupObj.salesTypeList.map(
          item => item.id
        );
        this.orderOverviewForm.get('saleType').patchValue(selected);
        break;

      case 'category':
        selected = [];
        selected = this.categories.map(
          item => item.id
        );
        this.orderOverviewForm.get('category').patchValue(selected);
        break;
    }
  }

  /**
   * @author om kanada
   * @description function call to clear all selected val from lookup
   * @param {string} clearSelectfor
   * @memberof OrderOverviewComponent
   */
  public onClearAll(clearSelectfor?: string): void {
    this.orderLookupObj.responsiblePesronList = this.preserveResponsiblePersonList;
    if (this.orderOverviewForm && clearSelectfor) {
      this.orderOverviewForm.get(clearSelectfor).patchValue([]);
    }
  }
  /**
   * @author om kanada
   * @description close drop-down
   * @param {NgSelectComponent} select
   * @memberof OrderOverviewComponent
   */
  public closeSelect(select: NgSelectComponent): void {
    select.close();
  }
  /**
   * @author om kanada
   * @createdDate 13/3/2020
   * @param {*}  inputvalue
   * @memberof OrderOverviewComponent
   */
  filterData(eventTarget) {
    this.orderLookupObj.responsiblePesronList = this.preserveResponsiblePersonList;
    this.orderLookupObj.responsiblePesronList = this.orderLookupObj.responsiblePesronList
      .filter(obj =>
        (obj.group && obj.group.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
        || (obj.name && obj.name.toLowerCase().indexOf(eventTarget.toLowerCase()) !== -1)
      );
  }
  // get graph data From Api and set Options
  public orderOverviewGraph(): void {
    if (this.orderOverviewForm.controls.responsiblePersonResult.value && this.orderOverviewForm.controls.responsiblePersonResult.value.length > 0) {
      if (this.orderOverviewForm.controls.commissionYearFrom.value > this.orderOverviewForm.controls.commissionYearTo.value) {
        this.messageService.showMessage("'Commission Year To' should be greater than 'Commission Year From'", 'error');
      } else {
        if (this.orderOverviewForm.controls.commissionYearFrom.value === this.orderOverviewForm.controls.commissionYearTo.value && this.orderOverviewForm.controls.commissionYearFrom.value > this.orderOverviewForm.controls.commissionYearTo.value) {
          this.messageService.showMessage("'Commission Month To' should be greater than 'Commission Month From'", 'error');
        } else {
          if (this.orderOverviewForm.controls.dateFrom.value) {
            this.orderOverviewForm.controls.dateFrom.setValue(moment(this.orderOverviewForm.controls.dateFrom.value).format('YYYY-MM-DD'));
          }
          if (this.orderOverviewForm.controls.dateTo.value) {
            this.orderOverviewForm.controls.dateTo.setValue(moment(this.orderOverviewForm.controls.dateTo.value).format('YYYY-MM-DD'));
          }
          if (moment(this.orderOverviewForm.controls.dateFrom.value).isAfter(this.orderOverviewForm.controls.dateTo.value)) {
            this.messageService.showMessage("'Date To' should be greater than 'Date From'", 'error');
          } else {
            const searchableData = JSON.parse(JSON.stringify(this.orderOverviewForm.value));
            searchableData.responsiblePerson = [];
            for (const responsiblePersonName of searchableData.responsiblePersonResult) {
              searchableData.responsiblePerson.push({ 'id': responsiblePersonName });
            }
            this.isShowDraw = false;
            if (searchableData.dateFrom) {
              searchableData.dateFrom = moment(searchableData.dateFrom).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(searchableData.dateFrom) ? '-04:00' : '-05:00');
            }
            if (searchableData.dateTo) {
              searchableData.dateTo = moment(searchableData.dateTo).format('YYYY-MM-DD') + 'T23:59:59' + (this.isDST(searchableData.dateTo) ? '-04:00' : '-05:00');
            }
            if (this.view) {
              searchableData['view'] = this.view;
            }
            this.orderOverviewService.orderOverviewGraph(searchableData).then((response) => {
              this.options.view = this.view;
              if (this.view === 'timeLine') {
                this.options.timeLine = this.orderOverviewForm.controls.timeLine.value;
                this.options.classification = [];
                this.options.XLineValues = [{
                  field: "time", labels: {
                    Color: "#000"
                  }
                }]
              } else {
                this.options.timeLine = undefined;
                this.options.classification = [{
                  type: "expert",
                  color: "#0000FF"
                }, {
                  type: "professional",
                  color: "#000000"
                }, {
                  type: "trainee",
                  color: "#009900"
                }];
                this.options.XLineValues = [{
                  field: "repName", labels: {
                    Color: "#000"
                  }
                },
                {
                  field: "joiningDate", labels: {
                    Color: "#000"
                  }
                }]
              }

              this.graphData = JSON.parse(JSON.stringify(response));
              this.cdr.detectChanges();
              this.toDrawGraph(response);
            },
              (error) => {
                console.log(error);
              });
          }

        }
      }
    }
  }
  // set IndicatorsLines
  public setIndicatorsLines(): void {
    if (this.view === 'responsible') {
      this.options.chart.IndicatorsLines = [0, 3000, 5000, 8000];
      let MonthGap = parseInt(this.orderOverviewForm.controls.commissionMonthTo.value, 0) - parseInt(this.orderOverviewForm.controls.commissionMonthFrom.value, 0);
      const yearGap = parseInt(this.orderOverviewForm.controls.commissionYearTo.value, 0) - parseInt(this.orderOverviewForm.controls.commissionYearFrom.value, 0);
      MonthGap += 1;
      if (MonthGap > 0) {
        MonthGap = MonthGap + (12 * yearGap);
        for (let i = 1; i < this.options.chart.IndicatorsLines.length; i++) {
          this.options.chart.IndicatorsLines[i] = this.options.chart.IndicatorsLines[i] * MonthGap;
        }
      }
    } else {
      if (this.orderOverviewForm.controls.timeLine.value === 'day') {
        this.options.chart.IndicatorsLines = [];
      } else {
        if (this.orderOverviewForm.controls.timeLine.value === 'week') {
          this.options.chart.IndicatorsLines = [0, 2000];
        } else if (this.orderOverviewForm.controls.timeLine.value === 'month') {
          this.options.chart.IndicatorsLines = [0, 3000, 5000, 8000];
        }
        const userLength = this.orderOverviewForm.controls.responsiblePersonResult.value.length;
        if (userLength > 0) {
          for (let i = 1; i < this.options.chart.IndicatorsLines.length; i++) {
            this.options.chart.IndicatorsLines[i] = this.options.chart.IndicatorsLines[i] * userLength;
          }
        }
      }
    }
  }

  public toDrawGraph(data): void {
    if (data !== undefined && data.length > 0) {
      for (const repData of data) {
        repData.refundPrice !== undefined && repData.refundPrice !== 0 ? repData.refundPrice = -Math.abs(repData.refundPrice) : repData.refundPrice;
      }
      if (this.view === 'responsible') {
        if (this.orderOverviewForm.controls.sortBy.value === 'Sales') {
          this.options.data = _.orderBy(data, [user => user.orderPrice === undefined || user.orderPrice === '' ? 0 : user.orderPrice], ['desc']);
        } else if (this.orderOverviewForm.controls.sortBy.value === 'Category') {
          this.options.data = _.orderBy(data, ['classification', 'joiningDate'], ['asc', 'asc']);
        }
      } else {
        this.options.data = data;
      }

      if (this.orderOverviewForm.controls.category.value && this.orderOverviewForm.controls.category.value.length > 0) {
        const category = this.orderOverviewForm.controls.category.value;
        this.options.data = this.options.data.filter(i => (category.indexOf(i.classification) > -1));
      }

      this.setIndicatorsLines();
      const maxValue = _.maxBy(this.options.data, (o) => { return o.orderPrice; });
      if (maxValue !== undefined) {
        this.setGap(maxValue.orderPrice);

        if (maxValue.orderPrice !== undefined && maxValue.orderPrice < 10000) {
          this.options.MaxRange = 10000;
        } else {
          this.options.MaxRange = this.getMinAndMaxValue(maxValue.orderPrice);
        }
      };
      const minValue = _.minBy(this.options.data, (o) => { return o.refundPrice; });
      if (minValue !== undefined) {
        if (minValue.refundPrice !== undefined && minValue.refundPrice > -2000 && this.options.gap < 2000) {
          this.options.MinRange = -2000;
        } else {
          this.options.MinRange = -Math.abs(this.getMinAndMaxValue(Math.abs(minValue.refundPrice)));
        }
      };
      if (this.options.data !== undefined && this.options.data.length > 0) {
        this.options.canvasWidth = ((this.options.data.length * 5) * window.screen.width) / 100;
      }
      this.isShowDraw = true;
      this.postalChannelService.PublishPostalEvent({
        data: true,
        channel: '',
        envelope: '',
        topic: 'CHANGES_BAR_GRAPH'
      });
      this.cdr.detectChanges();
    } else {
      this.options.data = [];
    }
  }

  public setGap(maxValue: any): void {
    if (maxValue > 0) {
      this.options.gap = 2000;
    }
    if (maxValue > 10000) {
      this.options.gap = 5000;
    }
    if (maxValue > 50000) {
      this.options.gap = 10000;
    }
    if (maxValue > 100000) {
      this.options.gap = 50000;
    }
  }

  public getMinAndMaxValue(price: any): any {
    const roundedPrice = Math.round(price);
    const addValue = this.options.gap - (roundedPrice % this.options.gap)
    return roundedPrice + addValue;
  }

  public sortByChange(event, type): void {
    if (this.graphData !== undefined && this.graphData.length > 0) {
      if (type === 'category') {
        this.orderOverviewForm.controls.category.setValue(event.id);
      }
      this.isShowDraw = false;
      this.toDrawGraph(this.graphData);
    }
    this.cdr.detectChanges();
  }

  public changeView() {
    if (this.view === 'responsible') {
      this.orderOverviewForm.controls.timeLine.setValue(undefined);
      this.isShowDraw = false;
      this.orderOverviewGraph();
    } else {
      this.orderOverviewForm.controls.timeLine.setValue('month');
      this.isShowDraw = false;
      this.orderOverviewGraph();
    }
  }
  onKeyDown(event, from) {
    this.orderOverviewForm.controls[from].setValue(moment(event).format('YYYY-MM-DD') + 'T00:00:00' + (this.isDST(event) ? '-04:00' : '-05:00'));
  }
  public reset() {
    this.orderOverviewForm.reset();
    this.changeDate();
    const responsiblePersonResult = [];
    for (const objV of this.preserveResponsiblePersonList) {
      if (objV.group.toLowerCase() === 'sales - atlanta' || objV.group.toLowerCase() === 'sales - rome') {
        // don't set default if users are Robert or Maurice
        if (objV.id !== '3d644a72-42fc-4cc5-a0cf-ed77db15b09e' && objV.id !== '1c4ada05-fec3-4886-b370-d12412a58d09') {
          responsiblePersonResult.push(objV.id);
        }
      }
    }
    this.orderOverviewForm.controls.responsiblePersonResult.setValue(JSON.parse(JSON.stringify(responsiblePersonResult)));
    this.view = 'responsible';
    this.orderOverviewForm.controls.sortBy.setValue('Sales');
    this.getYear(false);
    this.isShowDraw = false;
    this.cdr.detectChanges();
    this.orderOverviewGraph();
  }

  isDST(tmpDate: any): any {
    const tz = 'America/New_York'; // or whatever your time zone is
    const dt = moment(tmpDate).format('YYYY-MM-DD');
    return moment.tz(dt, tz).isDST();
  }

  getClassificationLookup(): void {
    this.orderOverviewService.getClassificationLookup().then((response: any) => {
      this.categories = response;
      this.cdr.detectChanges();
    }, (error) => {
      console.log(error);
    });
  }

  getYear(fromNgOnInit) {
    const today = new Date();
    this.yy = today.getFullYear();
    this.mm = today.getMonth() + 1;
    this.orderOverviewForm.controls.commissionMonthFrom.setValue((this.mm < 10) ? '0' + this.mm.toString() : this.mm.toString());
    this.orderOverviewForm.controls.commissionMonthTo.setValue((this.mm < 10) ? '0' + this.mm.toString() : this.mm.toString());
    this.orderOverviewForm.controls.commissionYearFrom.setValue(this.yy.toString());
    this.orderOverviewForm.controls.commissionYearTo.setValue(this.yy.toString());
    this.view = 'responsible';
    if (fromNgOnInit) {
      this.years = [];
      for (let i = 2014; i <= (this.yy + 1); i++) {
        this.years.push({ id: i.toString(), name: i.toString() });
      }
    }
  }

  initOrderOverviewForm(): void {
    this.orderOverviewForm = this.fb.group({
      responsiblePersonResult: [null, Validators.required],
      saleType: null,
      commissionMonthFrom: '',
      commissionYearFrom: '',
      commissionMonthTo: '',
      commissionYearTo: '',
      timeLine: null,
      dateFrom: '',
      dateTo: '',
      sortBy: null,
      category: null
    })
    this.orderOverviewForm.controls.sortBy.setValue('Sales');
    this.getLookupForOrderSearch(); // Combine API for Responsible & Sale Type
    this.getClassificationLookup();
    this.getYear(true);
  }

  changeDate(): void {
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnInit(): void {
    this.initOrderOverviewForm();
  }
  ngOnDestroy(): void {
    if (this.cdr) {
      this.cdr.detach();
    }
  }

}
