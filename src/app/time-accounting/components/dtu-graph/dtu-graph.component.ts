//   External imports
import { Component, OnInit, AfterViewInit, OnChanges, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

@Component({
  selector: 'dtu-graph',
  templateUrl: './dtu-graph.component.html',
  styleUrls: ['./dtu-graph.component.scss']
})

export class DTUGraphComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() options: DataGraphSettings;
  @Output() breakData = new EventEmitter<any>();

  graphId: string;
  counter: number = 0;  // set initial value
  isAfterViewInitCalled: boolean = false;
  innerPaddingTop = 15;
  innerPaddingRight = 10;
  innerPaddingBottom = 30;
  innerPaddingLeft = 75;
  breakDetails: any = [];
  breakIconDetails: any = [];
  dayNames: any = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  defaults: DataGraphSettings = {
    data: null,
    chart: {
      chartType: null,  //    stackedColumn
      dataListField: null,
      YpropertyName: null,
      priority: ["break", "meeting", "chat", "phoneOut", "pdSession", "phoneIn", "icons", "CheckIn", "CheckOut", "CheckInDuetoBreakByUser", "CheckInDuetoBreakByOther", "CheckOutDuetoBreakByUser", "CheckOutDuetoBreakByOther", "mailSentData"],
      chartProperty: [{
        barColor: null, //  color field like 'red' or '#ff0000'
        subJson: {
          startValueField: null,
          endValueField: null,
          dataCompareFiled: null,
          dataCompareValue: null
        } //  for x axis
      }]
    },
    yAxisType: null,
    xAxisType: null,
    canvasWidth: null,
    canvasHeight: null,
    fontStyle: 'italic',
    fontSize: '7pt',
    fontName: 'sans-serif',
    MaxRange: null,
    MinRange: null,
    xMinRange: null, //  if xAxisType is time then add min x range like '00:00'(hh:mm)
    yMinRange: null, //  if xAxisType is time then add max x range like '00:50'(hh:mm)
    xGap: {
      miniute: null, //   //  if xAxisType is time then add gap value in minute or hour
      hour: null,
    },
    labelOnXAxis: false,
    lineColor: '#fff',
    Color: '#fff',
    backgroundcolor: null,
    YLegendLabel: null,
    XLegendLabel: null,
    YLegendColor: '#fff',
    xyLocation: null,
    singleYPoint: null,
    singleXPoint: null,
    lineWidth: 1,
    yAxisData: null,
    isMiniute: false,
    //  not use out side
    visibleGraphWidth: null,
    visibleGraphHeight: null,
    canvas: null,
    context: null,
    verticalStepSize: null, //  xPadding
    horizontalStepSize: null,  //  ypadding
    RangeCount: null
  };

  constructor() { }

  drawchart(): void {
    $('#' + this.graphId).html('');
    const graphSettings = Object.assign({}, this.defaults, this.options);

    if (graphSettings.canvasWidth == null || graphSettings.canvasWidth == undefined) {
      graphSettings.canvasWidth = $('#' + this.graphId).width();
      if (graphSettings.canvasWidth <= 0) {
        graphSettings.canvasWidth = 274; // set a minimum width to the canvas
      }
    }

    if (graphSettings.labelOnXAxis) {
      this.innerPaddingRight = 20;
    } else {
      this.innerPaddingRight = 10;
    }

    if (graphSettings.yAxisType === 'date') {
      graphSettings.canvasHeight = ((this.calculateDays(graphSettings.MaxRange, graphSettings.MinRange) + 1) * 40) + 35;
    } else {
      graphSettings.YUniqueList = this.getYUniqueList(graphSettings.chart.YpropertyName, graphSettings.data);
      graphSettings.canvasHeight = (graphSettings.YUniqueList.length * 40) + 35;
    }

    this.displayYLegend(this, graphSettings);

    if (graphSettings.XLegendLabel !== null && graphSettings.XLegendLabel !== undefined) {
      graphSettings.canvasHeight = graphSettings.canvasHeight - 35;
    }

    //  if graphSettings.YLegendLabel has value the reset canvasWidth of canvas graphSettings.canvasWidth-35
    if (graphSettings.YLegendLabel !== null && graphSettings.YLegendLabel !== undefined) {
      graphSettings.canvasWidth = graphSettings.canvasWidth - 35;
    } else {
      if (graphSettings.backgroundcolor !== null && graphSettings.backgroundcolor !== undefined) {
        $('#' + this.graphId).attr('style', 'position: relative;padding-left:35px;float:left;width:100%;background-color:' + graphSettings.backgroundcolor + '');
      }
    }

    // add canvas
    this.addCanvas($('#' + this.graphId), graphSettings);

    this.displayXLegend($('#' + this.graphId), graphSettings);

    // Initialize graph common properties
    this.init($('#' + this.graphId), graphSettings);

    // base x and y line drawing
    this.drawBaseAxisLines(graphSettings);

    this.plotAxisLabels(graphSettings);

    //   //  ********************************************************************************Code for drawing chart Start************************************************************
    if (graphSettings.chart.chartType === 'stackedColumn') {
      this.drawBarChart(graphSettings);
    }
    //  ********************************************************************************Code for drawing chart End************************************************************
    //  });

    // Draw grid lines
    this.drawGridLines(graphSettings);

  }

  //  display Ylegend
  displayYLegend(obj: any, graphSettings: any) {
    if (graphSettings.YLegendLabel !== null && graphSettings.YLegendLabel !== undefined) {
      if (graphSettings.backgroundcolor !== null && graphSettings.backgroundcolor !== undefined) {
        $(obj).attr('style', 'position: relative;padding-left:35px;float:left;width:100%;background-color:' + graphSettings.backgroundcolor + '');
      } else {
        $(obj).attr('style', 'position: relative;padding-left:35px;float:left;');
      }
      let span = "<span style='width:" + (graphSettings.canvasHeight - this.innerPaddingLeft) + "px; position:absolute; left:-" + (graphSettings.canvasHeight - this.innerPaddingLeft) / 2 + "px; top:-20px;font-weight:600;color:" + graphSettings.YLegendColor + "'>" + graphSettings.YLegendLabel + "</span>";
      $(obj).append("<div style='position:absolute; text-align:center; height:0px; width:0px;  top:" + (graphSettings.canvasHeight - this.innerPaddingLeft) / 2 + "px;  -ms-transform: rotate(7deg); /* IE 9 */-webkit-transform: rotate(7deg); /* Chrome, Safari, Opera */transform: rotate(270deg);'>" + span + "</div>");
    }
  }

  //  display Xlegend
  displayXLegend(obj: any, graphSettings: any): any {
    if (graphSettings.XLegendLabel !== null && graphSettings.XLegendLabel !== undefined) {
      const span = "<span style='width:" + (graphSettings.canvasHeight - this.innerPaddingLeft) + "px;font-weight:600;color:" + graphSettings.YLegendColor + "'>" + graphSettings.XLegendLabel + "</span>";
      $(obj).append("<div style='text-align:center; top:" + graphSettings.canvasHeight + "px;'>" + span + "</div>");
    }
  }

  //  add canvas in current element
  addCanvas(obj, graphSettings) {
    const self = this;
    $(obj).append("<canvas id='" + $(obj).attr('id') + "_Canvas' width='" + (parseInt(graphSettings.canvasWidth)) + "' height='" + graphSettings.canvasHeight + "'></canvas>");
    $(obj).find("#" + $(obj).attr('id') + "_Canvas").click(function (e) { self.handleMouseClick(e, graphSettings); });
  }

  handleMouseClick(event, graphSettings) {
    let x, y;
    let inBreakDetails = false;
    let inBreakIconDetails = false;
    if (event.x !== undefined && event.y !== undefined) {
      x = event.x;
      y = event.y;
    } else {
      x = event.clientX;
      y = event.clientY;
    }
    let rect = graphSettings.canvas.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;
    for (let obj of this.breakDetails) {
      // if (!obj.longerBreak) {
      if ((x >= obj.xPoint && x <= (obj.xPoint + obj.barWidth)) && (y >= obj.yPoint && y <= obj.yPoint + obj.barHeight)) {
        if (obj.longerBreak) {
          obj.isBreakIcon = true;
        }
        inBreakDetails = true;
        this.breakData.emit(obj);
        break;
      }
      // }
    }
    if (!inBreakDetails) {
      for (let obj of this.breakIconDetails) {
        if (obj.longerBreak) {
          if ((x >= obj.xPoint && x <= (obj.xPoint + obj.barWidth)) && (y + 16 >= obj.yPoint && y <= obj.yPoint + obj.barHeight)) {
            inBreakIconDetails = true;
            obj.isBreakIcon = true;
            this.breakData.emit(obj);
            break;
          }
        }
      }
    }
  }

  init(element: any, graphSettings: any): any {
    graphSettings.canvas = document.getElementById($(element).attr('id') + "_Canvas");
    graphSettings.context = graphSettings.canvas.getContext('2d');

    if (graphSettings.yAxisType == "string") {
      let maxWidth = 0;
      for (let i = 0; i < graphSettings.YUniqueList.length; i++) {
        if (graphSettings.context.measureText(graphSettings.YUniqueList[i]).width > maxWidth) {
          maxWidth = graphSettings.context.measureText(graphSettings.YUniqueList[i]).width;
        }
      }
      if (maxWidth > this.innerPaddingLeft) {
        this.innerPaddingLeft = maxWidth;
      }
    }
    //  calculate padding for x side
    let timeDuration;
    if (graphSettings.xAxisType === 'time') {
      if (!graphSettings.isMiniute) {
        timeDuration = this.calculateTime(graphSettings.xMinRange, graphSettings.xMaxRange, (graphSettings.xGap.miniute === undefined && graphSettings.xGap.miniute == null) ? 'hour' : 'minute');
        graphSettings.xMinRange = timeDuration.start;
        graphSettings.xMaxRange = timeDuration.end;
      }

      if (graphSettings.xGap.miniute !== undefined && graphSettings.xGap.miniute !== null) {
        const numbers = ((graphSettings.canvasWidth - (this.innerPaddingLeft + this.innerPaddingRight)) / ((graphSettings.xMaxRange - graphSettings.xMinRange) / graphSettings.xGap.miniute)).toString();
        graphSettings.verticalStepSize = parseFloat(parseFloat(numbers).toFixed(3));
      }
      else if (graphSettings.xGap.hour !== undefined && graphSettings.xGap.hour !== null) {
        graphSettings.verticalStepSize = parseFloat(parseFloat(((graphSettings.canvasWidth - (this.innerPaddingLeft + this.innerPaddingRight)) / ((graphSettings.xMaxRange - graphSettings.xMinRange) / graphSettings.xGap.hour)).toString()).toFixed(3));
      }
      //  calculate graph canvasWidth base on verticalStepSize
      if (graphSettings.isMiniute) {
        graphSettings.visibleGraphWidth = parseFloat(parseFloat(((graphSettings.xMaxRange / graphSettings.xGap.miniute) * graphSettings.verticalStepSize).toString()).toFixed(3));
        graphSettings.singleXPoint = graphSettings.verticalStepSize / graphSettings.xGap.miniute; //  for per miniute
      }
      else {
        graphSettings.visibleGraphWidth = parseFloat(parseFloat(((timeDuration.diff + 1) * graphSettings.verticalStepSize).toString()).toFixed(3));
        graphSettings.singleXPoint = graphSettings.verticalStepSize / 3600; //  /for per sec
      }
    }



    if (graphSettings.yAxisType == "date") {
      let diffDays = 0;
      //calculate no of y value in y axis

      diffDays = this.calculateDays(graphSettings.MinRange, graphSettings.MaxRange);
      if (diffDays < 0) {
        console.log("MinRange must be less than MaxRange!");
        return;
      }
      if (graphSettings.gap == 0 || graphSettings.gap == null || graphSettings.gap == undefined) {
        graphSettings.RangeCount = diffDays + 1;
        graphSettings.gap = 1;
      }
      else {
        graphSettings.RangeCount = diffDays + 1 / graphSettings.gap;
      }
    } else if (graphSettings.yAxisType == "string") {
      if (graphSettings.MinRange > graphSettings.MaxRange) {
        console.log('MinRange must be less than MaxRange!');
        return;
      }

      graphSettings.RangeCount = graphSettings.YUniqueList.length;
      graphSettings.gap = 1;
    }
    //  calculate y padding for y side
    graphSettings.horizontalStepSize = parseFloat((parseFloat(((graphSettings.canvasHeight - this.innerPaddingBottom) / graphSettings.RangeCount).toString())).toFixed(3));
    graphSettings.singleYPoint = parseFloat((graphSettings.horizontalStepSize / graphSettings.gap).toString()).toFixed(3);

    //  calculate graph hight base on horizontalStepSize
    graphSettings.visibleGraphHeight = parseFloat(parseFloat((graphSettings.RangeCount * graphSettings.horizontalStepSize).toString()).toFixed(3)) + this.innerPaddingTop;
  }

  //  baseline for axis 
  drawBaseAxisLines(graphSettings) {
    graphSettings.context.beginPath();
    graphSettings.context.strokeStyle = graphSettings.lineColor;
    graphSettings.context.moveTo(this.innerPaddingLeft, this.innerPaddingTop);
    graphSettings.context.lineTo(this.innerPaddingLeft, graphSettings.visibleGraphHeight);
    graphSettings.context.stroke();
    graphSettings.context.lineTo(graphSettings.canvasWidth - this.innerPaddingRight, graphSettings.visibleGraphHeight);
    graphSettings.context.stroke();
    //   graphSettings.context.lineTo(graphSettings.canvasWidth - this.innerPaddingRight, this.innerPaddingTop);
    //   graphSettings.context.stroke();
  }

  //  grid drawing
  drawGridLines(graphSettings) {
    //   Horizontal Line
    graphSettings.context.strokeStyle = graphSettings.lineColor;
    graphSettings.context.beginPath();
    for (let y = this.innerPaddingTop; y <= graphSettings.visibleGraphHeight; y = parseFloat(parseFloat(y.toString()).toFixed(3)) + graphSettings.horizontalStepSize) {
      graphSettings.context.moveTo(this.innerPaddingLeft, y);
      graphSettings.context.lineTo(graphSettings.canvasWidth - this.innerPaddingRight, y);
      graphSettings.context.stroke();
    }
    // Vertical Line
    graphSettings.context.beginPath();
    graphSettings.context.strokeStyle = graphSettings.lineColor;
    for (let x = this.innerPaddingLeft + graphSettings.verticalStepSize; x <= graphSettings.visibleGraphWidth + this.innerPaddingLeft; x = parseFloat(parseFloat(x).toFixed(3)) + graphSettings.verticalStepSize) {
      graphSettings.context.moveTo(x, this.innerPaddingTop);
      graphSettings.context.lineTo(x, graphSettings.visibleGraphHeight);
      graphSettings.context.stroke();
    }
  }

  //  Plaot lables on axis
  plotAxisLabels(graphSettings) {
    let timestart = 0; //  only use when xAxisType is time
    if (graphSettings.xAxisType === 'time') {
      timestart = graphSettings.xMinRange;
    }
    graphSettings.context.beginPath();
    //  graphSettings.context.font = 'italic 7pt sans-serif';
    graphSettings.context.font = graphSettings.fontStyle + " " + graphSettings.fontSize + " " + graphSettings.fontName;
    graphSettings.context.fillStyle = graphSettings.Color;

    //  Ploat x axis label
    let i = graphSettings.xMinRange;
    for (let x = this.innerPaddingLeft; x <= (graphSettings.visibleGraphWidth + graphSettings.verticalStepSize) + this.innerPaddingLeft; x += graphSettings.verticalStepSize) {
      graphSettings.context.fillText(i, x, graphSettings.visibleGraphHeight + (this.innerPaddingBottom / 2));
      graphSettings.context.fillText(i, x, this.innerPaddingTop / 2);
      i++;
    }
    // Ploat y axis label
    if (graphSettings.yAxisType == "date") {
      var j = new Date(graphSettings.MinRange);
      for (var y = this.innerPaddingTop + graphSettings.horizontalStepSize; y <= graphSettings.visibleGraphHeight + graphSettings.horizontalStepSize; y += graphSettings.horizontalStepSize) {
        graphSettings.context.beginPath();
        graphSettings.context.font = graphSettings.fontStyle + " " + graphSettings.fontSize + " " + graphSettings.fontName;
        graphSettings.context.fillStyle = graphSettings.Color;

        if (graphSettings.chart.YDateStartLabel != undefined && graphSettings.chart.YDateStartLabel != "" && this.dayNames[j.getDay()] == "Sun") {
          let a = new Date(graphSettings.chart.YDateStartLabel);
          if (graphSettings.chart.isShowLabels === false) {
            graphSettings.context.fillText('', this.innerPaddingLeft / 4, y - 10);
          } else {
            graphSettings.context.fillText((a.getMonth() + 1) + '/' + a.getDate(), this.innerPaddingLeft / 4, y - 10);
          }
        }
        graphSettings.context.fillText(this.dayNames[j.getDay()], this.innerPaddingLeft / 4, y);
        var IsMin = this.getDataOfDate(j, graphSettings, "MIN");
        var IsMax = this.getDataOfDate(j, graphSettings, "MAX");

        if (IsMin) {
          this.drawImage(graphSettings.MinIndicators, this.innerPaddingLeft - 10, y - 9, graphSettings);
        }
        if (IsMax) {
          this.drawImage(graphSettings.MaxIndicators, graphSettings.canvasWidth - 25, y - 9, graphSettings);
        }
        j.setDate(j.getDate() + 1);
      }
    } else if (graphSettings.yAxisType == "string") {
      let i = 0;
      for (let y = this.innerPaddingTop + graphSettings.horizontalStepSize; y <= graphSettings.visibleGraphHeight + graphSettings.horizontalStepSize; y += graphSettings.horizontalStepSize) {
        if (i <= graphSettings.YUniqueList.length) {
          graphSettings.context.beginPath();
          graphSettings.context.font = graphSettings.fontStyle + " " + graphSettings.fontSize + " " + graphSettings.fontName;
          graphSettings.context.fillStyle = graphSettings.Color;
          if (graphSettings.chart.isShowLabels === false) {
            graphSettings.context.fillText('', this.innerPaddingLeft / 4, y);
          } else {
            graphSettings.context.fillText(graphSettings.YUniqueList[i], this.innerPaddingLeft / 4, y);
          }
          const IsMin = this.getDataOfDate(graphSettings.YUniqueList[i], graphSettings, "MIN");
          const IsMax = this.getDataOfDate(graphSettings.YUniqueList[i], graphSettings, "MAX");

          if (IsMin) {
            this.drawImage(graphSettings.MinIndicators, this.innerPaddingLeft - 10, y - 9, graphSettings);
          }
          if (IsMax) {
            this.drawImage(graphSettings.MaxIndicators, graphSettings.canvasWidth - 25, y - 9, graphSettings);
          }
          i++;
        }
      }
    }
  }

  getDataOfDate(currentValue: any, graphSettings: any, findFor: any): any {
    const returnedData = $.grep(graphSettings.data, function (element: any, index: any): any {
      if (graphSettings.yAxisType === 'date') {
        return (new Date(element[graphSettings.chart.YpropertyName])).getDate() === currentValue.getDate();
      } else if (graphSettings.yAxisType === 'string') {
        return (element[graphSettings.chart.YpropertyName] === currentValue);
      }
    });

    if (returnedData != null && returnedData.length > 0) {
      let count = 0;
      $.each(returnedData[0][graphSettings.chart.dataListField], function (index, element) {
        if (findFor == "MIN") {
          let minTime = new Date('01/01/2000' + " " + "0" + graphSettings.xMinRange + ":00");
          let currentTime = new Date('01/01/2000' + " " + element[graphSettings.chart.XpropertyName]);
          if (moment(currentTime).diff(minTime, 'second') < 0) {
            count++;
            return false;
          }
        }
        else if (findFor == "MAX") {
          let maxTime = new Date('01/01/2000' + " " + "0" + graphSettings.xMaxRange + ":00");
          let currentTime = new Date('01/01/2000' + " " + element[graphSettings.chart.XpropertyName]);

          if (moment(maxTime).diff(currentTime, 'second') < 0) {
            count++;
            return false;
          }
        }
      });

      if (count > 0) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }

  //  draw bar chart
  drawBarChart(graphSettings) {
    let startXaxisPoint = (graphSettings.xMinRange * 3600) * graphSettings.singleXPoint;

    for (let i = 0; i < graphSettings.data.length; i++) {
      let filedNameofY = (graphSettings.chart.YpropertyName == null || graphSettings.chart.YpropertyName == undefined) ? graphSettings.YLineValues : graphSettings.chart.YpropertyName
      let yCurrentLocation;
      if (graphSettings.yAxisType == "date") {
        let dayNumber = this.calculateDays(graphSettings.data[i][filedNameofY], graphSettings.MinRange) + 1;
        yCurrentLocation = dayNumber * graphSettings.horizontalStepSize;
      }
      else if (graphSettings.yAxisType == "string") {
        if (graphSettings.data !== undefined && graphSettings.data[i] !== undefined) {
          let dataIndex = this.getDataIndex(graphSettings.data[i][filedNameofY], graphSettings.YUniqueList) + 1;
          yCurrentLocation = dataIndex * graphSettings.horizontalStepSize;
        }
      }

      if (graphSettings.data[i][graphSettings.chart.dataListField] !== undefined) {
        let groupsArr = [];
        let bandArr = [];
        let beforeChat = [];
        // Band  Configuration
        if (graphSettings.chart.isBand) {
          // 
          let priority = graphSettings.chart.priority;
          let a = _.groupBy(graphSettings.data[i][graphSettings.chart.dataListField], function (obj) {
            return obj[graphSettings.chart.groupBy];
          });
          for (let key of priority) {
            let isExists = graphSettings.chart.bandSupported.findIndex(value => value === key);
            if (a[key] !== undefined && a[key] !== null && a[key].length > 0) {
              if (isExists === -1) {
                for (let obj of a[key]) {
                  if (key !== 'meeting') {
                    groupsArr.push(obj);
                  } else {
                    beforeChat.push(obj);
                  }
                }
              } else {
                // BAND LOGICS
                for (let obj of a[key]) {
                  bandArr.push(obj);
                }
              }
            }
          }
          graphSettings.data[i][graphSettings.chart.dataListField] = groupsArr;
        } else {
          groupsArr = graphSettings.data[i][graphSettings.chart.dataListField];
          bandArr = [];
        }
        if (beforeChat.length > 0) {
          for (let j = 0; j < beforeChat.length; j++) {
            for (let k = 0; k < graphSettings.chart.chartProperty.length; k++) {
              let subData = beforeChat;
              if (subData[j][graphSettings.chart.chartProperty[k].subJson.dataCompareFiled] == graphSettings.chart.chartProperty[k].subJson.dataCompareValue) {
                graphSettings.context.beginPath();
                let xCurrentLocation = null;
                let startTime = null;
                let endTime = null;
                let timeDiffrence = null;
                let barWidth = null;

                let startDateValue = new Date('01/01/2000' + " " + subData[j][graphSettings.chart.chartProperty[k].subJson.startValueField]);
                let endDateValue = new Date('01/01/2000' + " " + subData[j][graphSettings.chart.chartProperty[k].subJson.endValueField]);
                let startDiff = moment(startDateValue).diff(new Date('01/01/2000' + " " + graphSettings.xMinRange + ":00"), 'seconds');
                let endDiff = moment(new Date('01/01/2000' + " " + graphSettings.xMaxRange + ":00")).diff(endDateValue, 'seconds');
                if (startDiff >= 0 && endDiff >= 0) {
                  startTime = startDateValue.getHours() * 3600 + startDateValue.getMinutes() * 60 + startDateValue.getSeconds();
                  endTime = endDateValue.getHours() * 3600 + endDateValue.getMinutes() * 60 + endDateValue.getSeconds();

                  xCurrentLocation = (startTime * graphSettings.singleXPoint) - startXaxisPoint;

                  if (graphSettings.chart.chartProperty[k].Image !== undefined) {
                    graphSettings.context.globalCompositeOperation = 'source-over';
                    this.drawImage(graphSettings.chart.chartProperty[k].Image, xCurrentLocation + this.innerPaddingLeft - 6, yCurrentLocation + 2, graphSettings, 16, 30);
                  }
                  else {
                    barWidth = (endTime - startTime) * graphSettings.singleXPoint;

                    graphSettings.context.fillStyle = graphSettings.chart.chartProperty[k].barColor;
                    if (graphSettings.chart.chartProperty[k].barHeight != undefined &&
                      graphSettings.chart.chartProperty[k].barHeight != "" &&
                      graphSettings.chart.chartProperty[k].barHeight > 0) {
                      graphSettings.context.rect(xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth,
                        yCurrentLocation + graphSettings.chart.chartProperty[k].yCurrentLocation, barWidth, graphSettings.chart.chartProperty[k].barHeight);

                    }
                    else {
                      graphSettings.context.globalCompositeOperation = 'source-over';
                      graphSettings.context.rect(xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth, yCurrentLocation - 16, barWidth, 30);
                    }
                    //graphSettings.context.globalCompositeOperation='source-over';
                    graphSettings.context.fill();
                  }
                  if (subData[j][graphSettings.chart.chartProperty[k].subJson.barLabel] !== undefined && subData[j][graphSettings.chart.chartProperty[k].subJson.barLabel] !== '') {
                    graphSettings.context.fillStyle = graphSettings.chart.chartProperty[k].barLabelColor;
                    graphSettings.context.globalCompositeOperation = 'destination-over';
                    graphSettings.context.fillText(subData[j][graphSettings.chart.chartProperty[k].subJson.barLabel], xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth + 3, yCurrentLocation - 7);
                    if (subData[j].longerBreak) {
                      this.drawImage('assets/images/break.png', xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth + 20, yCurrentLocation, graphSettings, 10, 10, );
                    }
                  }
                }
              }
            }
          }
        }

        // Band Supporting Plotting Data
        if (bandArr.length > 0) {

          // CREATING BANDS 
          let bandsData = {};
          for (let count = 0; count < graphSettings.chart.bandCount; count++) {
            bandsData['band' + (count + 1)] = [];
          }

          let lastKeys = Object.keys(bandsData)[graphSettings.chart.bandCount - 1];
          for (let obj of bandArr) {
            var startTime = "ST";
            var endTime = "ET";
            var currentST = '01/01/2000 ' + obj.ST;
            var currentET = '01/01/2000 ' + obj.ET;
            for (let key in bandsData) {
              let temp = bandsData[key].filter(t =>
                (Date.parse(currentST) >= Date.parse('01/01/2000 ' + t[startTime])) && (Date.parse(currentET) <= Date.parse('01/01/2000 ' + t[endTime]))
                || (Date.parse(currentST) <= Date.parse('01/01/2000 ' + t[startTime])) && (Date.parse(currentET) <= Date.parse('01/01/2000 ' + t[endTime]))
                || (Date.parse(currentST) <= Date.parse('01/01/2000 ' + t[startTime])) && (Date.parse(currentET) <= Date.parse('01/01/2000 ' + t[endTime]))
                || (Date.parse(currentST) <= Date.parse('01/01/2000 ' + t[startTime])) && (Date.parse(currentET) >= Date.parse('01/01/2000 ' + t[endTime]))
                || (Date.parse(currentST) <= Date.parse('01/01/2000 ' + t[endTime])) && (Date.parse(currentET) >= Date.parse('01/01/2000 ' + t[startTime]))
              );
              //  || lastKeys === key
              if (temp.length === 0 || lastKeys === key) {
                bandsData[key].push(obj);
                break;
              }
            }
          }
          let totalBands = graphSettings.chart.bandCount;
          // FOR DYNAMIC BANDS
          // let totalBands = 0;
          // for (let index in bandsData) {
          //     if (bandsData[index].length > totalBands) {
          //         totalBands = bandsData[index].length;
          //     }
          //     if (bandsData[index] === undefined || bandsData[index] === null || bandsData[index].length === 0) {
          //         delete bandsData[index];
          //     }
          // }
          let bandCounter = 0;
          for (let key in bandsData) {
            for (let j = 0; j < bandsData[key].length; j++) {
              for (let k = 0; k < graphSettings.chart.chartProperty.length; k++) {
                let subData = bandsData[key];
                if (subData[j][graphSettings.chart.chartProperty[k].subJson.dataCompareFiled] == graphSettings.chart.chartProperty[k].subJson.dataCompareValue) {
                  graphSettings.context.beginPath();
                  let xCurrentLocation = null;
                  let startTime = null;
                  let endTime = null;
                  let timeDiffrence = null;
                  let barWidth = null;

                  let startDateValue = new Date('01/01/2000' + " " + subData[j][graphSettings.chart.chartProperty[k].subJson.startValueField]);
                  let endDateValue = new Date('01/01/2000' + " " + subData[j][graphSettings.chart.chartProperty[k].subJson.endValueField]);
                  let startDiff = moment(startDateValue).diff(new Date('01/01/2000' + " " + graphSettings.xMinRange + ":00"), 'seconds');
                  let endDiff = moment(new Date('01/01/2000' + " " + graphSettings.xMaxRange + ":00")).diff(endDateValue, 'seconds');
                  if (startDiff >= 0 && endDiff >= 0) {
                    startTime = startDateValue.getHours() * 3600 + startDateValue.getMinutes() * 60 + startDateValue.getSeconds();
                    endTime = endDateValue.getHours() * 3600 + endDateValue.getMinutes() * 60 + endDateValue.getSeconds();

                    xCurrentLocation = (startTime * graphSettings.singleXPoint) - startXaxisPoint;

                    if (graphSettings.chart.chartProperty[k].Image !== undefined) {
                      graphSettings.context.globalCompositeOperation = 'source-over';
                      this.drawImage(graphSettings.chart.chartProperty[k].Image, xCurrentLocation + this.innerPaddingLeft - 6, yCurrentLocation + 2, graphSettings, 16, 30);
                    }
                    else {
                      barWidth = (endTime - startTime) * graphSettings.singleXPoint;
                      graphSettings.context.fillStyle = graphSettings.chart.chartProperty[k].barColor;
                      graphSettings.context.globalCompositeOperation = 'source-over';
                      let barHeight = 30 / totalBands;
                      let xPosition = xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth;
                      let yPosition = (yCurrentLocation + ((30 - barHeight) - (barHeight * bandCounter))) - 16;

                      // INTENSITY CALCULATION
                      if (graphSettings.chart.chartProperty[k].subJson.isIntensity) {
                        if (subData[j][graphSettings.chart.chartProperty[k].subJson.intensityDataLabel] !== undefined) {
                          for (let obj of subData[j][graphSettings.chart.chartProperty[k].subJson.intensityDataLabel]) {
                            let startDateValueIntensity = new Date('01/01/2000' + " " + obj[graphSettings.chart.chartProperty[k].subJson.intensityConfiguration.startValueField]);
                            let endDateValueIntensity = new Date('01/01/2000' + " " + obj[graphSettings.chart.chartProperty[k].subJson.intensityConfiguration.endValueField]);
                            let startDiffIntensity = moment(startDateValueIntensity).diff(new Date('01/01/2000' + " " + graphSettings.xMinRange + ":00"), 'seconds');
                            let endDiffIntensity = moment(new Date('01/01/2000' + " " + graphSettings.xMaxRange + ":00")).diff(endDateValueIntensity, 'seconds');
                            if (startDiffIntensity >= 0 && endDiffIntensity >= 0) {
                              let startTimeIntensity = startDateValueIntensity.getHours() * 3600 + startDateValueIntensity.getMinutes() * 60 + startDateValueIntensity.getSeconds();
                              let endTimeIntensity = endDateValueIntensity.getHours() * 3600 + endDateValueIntensity.getMinutes() * 60 + endDateValueIntensity.getSeconds();
                              let xCurrentLocationIntensity = ((startTimeIntensity * graphSettings.singleXPoint) - startXaxisPoint) + this.innerPaddingLeft + graphSettings.context.lineWidth;
                              let barWidthIntensity = (endTimeIntensity - startTimeIntensity) * graphSettings.singleXPoint;
                              graphSettings.context.fillStyle = graphSettings.chart.chartProperty[k].barColor;
                              if (obj[graphSettings.chart.chartProperty[k].subJson.intensityConfiguration.dataCompareFiled] === 'high') {
                                graphSettings.context.rect(xCurrentLocationIntensity, yPosition, barWidthIntensity, barHeight - 1);
                              }
                              else if (obj[graphSettings.chart.chartProperty[k].subJson.intensityConfiguration.dataCompareFiled] === 'low') {
                                graphSettings.context.rect(xCurrentLocationIntensity, yPosition + ((barHeight - 1) / 2), barWidthIntensity, 1);
                              }
                              graphSettings.context.fill();
                            }
                          }
                        } else {
                          graphSettings.context.rect(xPosition, yPosition, barWidth, barHeight);
                          graphSettings.context.fill();
                        }
                      } else {
                        graphSettings.context.rect(xPosition, yPosition, barWidth, barHeight);
                        graphSettings.context.fill();
                      }
                    }
                    if (subData[j][graphSettings.chart.chartProperty[k].subJson.barLabel] !== undefined && subData[j][graphSettings.chart.chartProperty[k].subJson.barLabel] !== '') {
                      graphSettings.context.fillStyle = graphSettings.chart.chartProperty[k].barLabelColor;
                      graphSettings.context.globalCompositeOperation = 'destination-over';
                      graphSettings.context.fillText(subData[j][graphSettings.chart.chartProperty[k].subJson.barLabel], xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth + 3, yCurrentLocation - 7);
                      if (subData[j].longerBreak) {
                        this.drawImage('assets/images/break.png', xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth + 20, yCurrentLocation, graphSettings, 10, 10, );
                      }
                    }
                  }
                }
              }
            }
            bandCounter++;
          }
        }

        // Unsuporting Band Plootting Data
        if (groupsArr.length > 0) {
          for (let j = 0; j < groupsArr.length; j++) {
            for (let k = 0; k < graphSettings.chart.chartProperty.length; k++) {
              let subData = groupsArr;
              if (subData[j][graphSettings.chart.chartProperty[k].subJson.dataCompareFiled] == graphSettings.chart.chartProperty[k].subJson.dataCompareValue) {
                graphSettings.context.beginPath();
                let xCurrentLocation = null;
                let startTime = null;
                let endTime = null;
                let timeDiffrence = null;
                let barWidth = null;

                let startDateValue = new Date('01/01/2000' + " " + subData[j][graphSettings.chart.chartProperty[k].subJson.startValueField]);
                let endDateValue = new Date('01/01/2000' + " " + subData[j][graphSettings.chart.chartProperty[k].subJson.endValueField]);
                let startDiff = moment(startDateValue).diff(new Date('01/01/2000' + " " + graphSettings.xMinRange + ":00"), 'seconds');
                let endDiff = moment(new Date('01/01/2000' + " " + graphSettings.xMaxRange + ":00")).diff(endDateValue, 'seconds');
                if (startDiff >= 0 && endDiff >= 0) {
                  startTime = startDateValue.getHours() * 3600 + startDateValue.getMinutes() * 60 + startDateValue.getSeconds();
                  endTime = endDateValue.getHours() * 3600 + endDateValue.getMinutes() * 60 + endDateValue.getSeconds();

                  xCurrentLocation = (startTime * graphSettings.singleXPoint) - startXaxisPoint;

                  if (graphSettings.chart.chartProperty[k].Image !== undefined) {
                    graphSettings.context.globalCompositeOperation = 'source-over';
                    if (graphSettings.chart.chartProperty[k].Image == 'assets/images/up.png' || graphSettings.chart.chartProperty[k].Image == 'assets/images/down.png'
                      || graphSettings.chart.chartProperty[k].Image == 'assets/images/blueup.png' || graphSettings.chart.chartProperty[k].Image == 'assets/images/bluedown.png'
                      || graphSettings.chart.chartProperty[k].Image == 'assets/images/redup.png' || graphSettings.chart.chartProperty[k].Image == 'assets/images/reddown.png') {
                      this.drawImage(graphSettings.chart.chartProperty[k].Image, xCurrentLocation + this.innerPaddingLeft - 6, ((yCurrentLocation + (graphSettings.chart.chartProperty[k].yCurrentLocation ? graphSettings.chart.chartProperty[k].yCurrentLocation : 0)) - (graphSettings.horizontalStepSize / 2)) + 8, graphSettings, 16, graphSettings.horizontalStepSize + 2);
                    } else {
                      this.drawImage(graphSettings.chart.chartProperty[k].Image, xCurrentLocation + this.innerPaddingLeft - 6, yCurrentLocation + 2, graphSettings, 16, 30);
                    }

                  }
                  else {
                    barWidth = (endTime - startTime) * graphSettings.singleXPoint;
                    if (barWidth == 0) {
                      barWidth = 1;
                    }
                    let yPoint;
                    let barHeight;
                    graphSettings.context.fillStyle = graphSettings.chart.chartProperty[k].barColor;
                    if (graphSettings.chart.chartProperty[k].barHeight != undefined &&
                      graphSettings.chart.chartProperty[k].barHeight != "" &&
                      graphSettings.chart.chartProperty[k].barHeight > 0) {
                      graphSettings.context.rect(xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth,
                        yCurrentLocation + graphSettings.chart.chartProperty[k].yCurrentLocation, barWidth, graphSettings.chart.chartProperty[k].barHeight);
                      yPoint = yCurrentLocation + graphSettings.chart.chartProperty[k].yCurrentLocation;
                      barHeight = graphSettings.chart.chartProperty[k].barHeight
                    }
                    else {
                      graphSettings.context.globalCompositeOperation = 'source-over';
                      graphSettings.context.rect(xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth, yCurrentLocation - 16, barWidth, 30);
                      yPoint = yCurrentLocation - 16;
                      barHeight = 16;
                    }
                    //graphSettings.context.globalCompositeOperation='source-over';
                    graphSettings.context.fill();

                    if (subData[j].TYP == 'break') {
                      let obj = {
                        xPoint: xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth,
                        yPoint: yPoint,
                        barWidth: barWidth,
                        barHeight: barHeight,
                        date: graphSettings.data[i].DT
                      }
                      obj = Object.assign(obj, subData[j])
                      this.breakDetails.push(obj);
                    }
                  }



                  if (subData[j][graphSettings.chart.chartProperty[k].subJson.barLabel] !== undefined && subData[j][graphSettings.chart.chartProperty[k].subJson.barLabel] !== '') {
                    graphSettings.context.fillStyle = graphSettings.chart.chartProperty[k].barLabelColor;
                    graphSettings.context.globalCompositeOperation = 'destination-over';
                    graphSettings.context.fillText(subData[j][graphSettings.chart.chartProperty[k].subJson.barLabel], xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth + 3, yCurrentLocation - 7);
                    if (subData[j].longerBreak) {
                      let obj = {
                        xPoint: xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth + 20,
                        yPoint: yCurrentLocation - 16,
                        barWidth: 10,
                        barHeight: 10,
                        date: graphSettings.data[i].DT
                      }
                      obj = Object.assign(obj, subData[j])
                      this.breakIconDetails.push(obj);
                      this.drawImage('assets/images/break.png', xCurrentLocation + this.innerPaddingLeft + graphSettings.context.lineWidth + 20, yCurrentLocation, graphSettings, 10, 10, );
                    }
                  }
                }
              }
            }
          }
        }
      }

    }
  }

  displayBarLabel(xyLocation, label, graphSettings, currentIndex) {
    let previousYLocation = 0;
    let index = ~~(xyLocation.length / 2);
    if (currentIndex > 0) {
      $.each(graphSettings.xyLocation[currentIndex], function (i, element) {
        if (element.Xvalue == xyLocation[index].Xvalue) {
          previousYLocation = element.YPoint;
          return;
        }
      });
    }
    this.drawBarToolTip(xyLocation[index].XPoint, (xyLocation[index].YPoint + xyLocation[index].BarHeight / 2), label, graphSettings);
  }

  drawBarToolTip(x, y, text, graphSettings) {
    graphSettings.context.beginPath();
    graphSettings.context.moveTo(x, y);
    let labelWidth = 100; //   graphSettings.context.measureText(text).width + 10;
    let textStartfrom = (labelWidth - graphSettings.context.measureText(text).width) / 2
    graphSettings.context.lineWidth = 1;

    if (x + 70 > graphSettings.visibleGraphWidth) {
      graphSettings.context.fillStyle = "#fff";
      graphSettings.context.fillRect(x + 10 - labelWidth, y - 25, labelWidth - 20, 17);
      graphSettings.context.fillStyle = "#003e84";
      graphSettings.context.font = 'italic 9pt sans-serif';
      graphSettings.context.fillText(text, (x - labelWidth) + 15, y - 12);
      graphSettings.context.fillStyle = "#fff";
      //   Filled triangle
      graphSettings.context.beginPath();
      graphSettings.context.moveTo(x - 18, y - 22);
      graphSettings.context.lineTo(x, y - 22);
      graphSettings.context.lineTo(x - 18, y - 8);
      graphSettings.context.fill();
    }
    else {
      graphSettings.context.beginPath();
      graphSettings.context.strokeStyle = "#003e84";
      graphSettings.context.fillStyle = "#fff";
      graphSettings.context.fillRect(x - (labelWidth / 2), y - 30, labelWidth, 20);
      graphSettings.context.fillStyle = "#003e84";
      graphSettings.context.strokeRect(x - (labelWidth / 2), y - 30, labelWidth, 20);
      graphSettings.context.font = 'italic 9pt sans-serif';
      graphSettings.context.fillText(text, x - (labelWidth / 2) + textStartfrom, y - 17);
      graphSettings.context.fillStyle = "#fff";
      //   Filled triangle
      graphSettings.context.beginPath();
      graphSettings.context.strokeStyle = "#003e84";
      graphSettings.context.moveTo(x - 2, y - 11);
      graphSettings.context.lineTo(x + 3, y - 1);
      graphSettings.context.lineTo(x + 9, y - 11.25);
      graphSettings.context.fill();
      graphSettings.context.stroke();
    }
  }


  drawImage(src: any, x: any, y: any, graphSettings: any, width?: number, height?: any): any {
    if (height === undefined || height === null || height === 0) {
      height = 16;
    }
    if (width === undefined || width === null || width === 0) {
      width = 16;
    }
    const img = new Image();
    img.onload = function (): any {
      if (graphSettings.canvasWidth <= 275) {
        graphSettings.context.drawImage(img, x, y - 16, width, height);
      } else {
        graphSettings.context.drawImage(img, x, y - 16, width, height);
      }
    };
    img.src = src;
  }

  drawToolTip(x, y, text, graphSettings) {
    graphSettings.context.beginPath();
    let labelWidth = 60;
    if (x + 70 > graphSettings.visibleGraphWidth) {
      graphSettings.context.fillStyle = '#fff';
      graphSettings.context.fillRect(x + 10 - labelWidth, y - 35, labelWidth, 17);
      graphSettings.context.fillStyle = '#003e84';
      graphSettings.context.font = 'italic 9pt sans-serif';
      graphSettings.context.fillText(text, (x - labelWidth) + 15, y - 23);
      graphSettings.context.fillStyle = '#fff';
      //   Filled triangle
      graphSettings.context.beginPath();
      graphSettings.context.moveTo((x - 10) + 5, y - 20);
      graphSettings.context.lineTo((x - 10) + 5, y - 2);
      graphSettings.context.lineTo((x - 10) + 13, y - 20);
      graphSettings.context.fill();
    } else {
      graphSettings.context.fillStyle = '#fff';
      graphSettings.context.fillRect(x, y - 35, labelWidth, 17);
      graphSettings.context.fillStyle = '#003e84';
      graphSettings.context.font = 'italic 9pt sans-serif';
      graphSettings.context.fillText(text, x + 5, y - 23);
      graphSettings.context.fillStyle = '#fff';
      //   Filled triangle
      graphSettings.context.beginPath();
      graphSettings.context.moveTo(x + 5, y - 20);
      graphSettings.context.lineTo(x + 5, y - 2);
      graphSettings.context.lineTo(x + 13, y - 20);
      graphSettings.context.fill();
    }
  }

  getYUniqueList(key: any, data: any) {
    let xArray = [];
    $(data).each(function (index, element) {
      if (element !== undefined && element !== null) {
        if ($.inArray(element[key], xArray) == -1) {
          xArray.push(element[key]);
        }
      }
    });
    return xArray;

  }

  // search data index
  getDataIndex(value, data) {
    let result = -1;
    data.some(function (item, i) {
      if (item === value) {
        result = i;
        return true;
      }
    });
    return result;
  }


  calculateDays(MinRange, MaxRange) {
    let diffDays = moment(new Date(MaxRange)).diff(new Date(MinRange), 'days');
    diffDays = Math.abs(diffDays);
    return diffDays;
  }

  //  Calculate time if yAxis type is time
  calculateTime(MinRange, MaxRange, timeType) {
    //  create date format 
    let timeStart;
    let timeEnd;
    if (timeType === "hour") {
      timeStart = new Date("01/01/2007 " + MinRange).getHours();
      timeEnd = new Date("01/01/2007 " + MaxRange).getHours();
    }
    else if (timeType == "minute") {
      timeStart = new Date("01/01/2007 " + MinRange).getMinutes();
      timeEnd = new Date("01/01/2007 " + MaxRange).getMinutes();
    }
    //if MaxRange is 24 i.e the end of day
    if (timeType == 'hour' && timeEnd == 0) {
      timeEnd = 24;
    }

    let hourDiff = timeEnd - timeStart;
    return { start: timeStart, end: timeEnd, diff: hourDiff };
  }

  ngOnChanges(): void {
    if (this.isAfterViewInitCalled === true) {
      this.drawchart();
    }
  }

  ngOnInit(): void {
    this.graphId = `DTUGraph-${this.counter++}`;  // set initial value with increment counter variable
  }

  ngAfterViewInit(): void {
    this.isAfterViewInitCalled = true;
    this.drawchart();
  }

}

export interface DataGraphSettings {
  data?: string;
  chart?: DataChart;
  yAxisType?: string;
  xAxisType?: string;
  canvasWidth?: number;
  canvasHeight?: number;
  fontStyle?: string;
  fontSize?: string;
  fontName?: string;
  MaxRange?: string;
  MinRange?: string;
  xMinRange?: string;
  yMinRange?: string;
  xGap?: XGap;
  labelOnXAxis?: boolean;
  lineColor?: string;
  Color?: string;
  backgroundcolor?: string;
  YLegendLabel?: string;
  XLegendLabel?: string;
  YLegendColor?: string;
  xyLocation?: string;
  singleYPoint?: string;
  singleXPoint?: string;
  lineWidth?: number;
  yAxisData?: string;
  isMiniute?: boolean;
  visibleGraphWidth?: string;
  visibleGraphHeight?: string;
  canvas?: string;
  context?: string;
  verticalStepSize?: string;
  horizontalStepSize?: string;
  RangeCount?: string;
  YUniqueList?: Array<any>;
};

export interface XGap {
  miniute?: number;
  hour?: number;
}

export interface DataChart {
  chartType?: string;
  dataListField?: string;
  YpropertyName?: string;
  YDateStartLabel?: string;
  chartProperty?: Array<ChartProperty>;
  isShowLabels?: boolean;
  priority?: string[];
};

export interface ChartProperty {
  barColor?: string;
  subJson?: SubJson;
};

export interface SubJson {
  startValueField?: string;
  endValueField?: string;
  dataCompareFiled?: string;
  dataCompareValue?: string;
};