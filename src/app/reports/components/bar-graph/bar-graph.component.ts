import { Component, OnInit, Input } from '@angular/core';
import { PostalChannelService } from '@app/shared/services';


export interface DataGraphStyles {
  height?: string;
  width?: string;
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
  gap?: number;
  labelOnXAxis?: boolean;
  lineColor?: string;
  Color?: string;
  backgroundcolor?:
  string; YLegendLabel?:
  string; XLegendLabel?: string;
  YLegendColor?: string;
  xyLocation?: string;
  singleYPoint?: string;
  singleXPoint?: string;
  lineWidth?: number;
  yAxisData?: string;
  isMinute?: boolean;
  visibleGraphWidth?: string;
  visibleGraphHeight?: string;
  canvas?: string;
  context?: string;
  verticalStepSize?: string;
  horizontalStepSize?: string;
  RangeCount?: string;
  YUniqueList?: Array<any>;
  xLabelValues?: any;
  stepSkipfromY?: number;
  stepSkipfromX?: any;
  XLineValues?: any;
  ZeroLocation?: any;
  classification?: any;
};

export interface DataChart {
  chartType?: string;
  dataListField?: string;
  YpropertyName?: string;
  YDateStartLabel?: string;
  chartProperty?: Array<ChartProperty>;
  IndicatorsLines?: Array<any>;
  showVerticalGrid?: boolean;
};

export interface ChartProperty {
  barColor?: string;
  subJson?: SubJson;
  YpropertyName?: any;
};
export interface SubJson {
  startValueField?: string;
  endValueField?: string;
  dataCompareFiled?: string;
  dataCompareValue?: string;
};

export interface XGap {
  minute?: number;
  hour?: number;
}

@Component({
  selector: 'app-bar-graph',
  templateUrl: 'bar-graph.component.html',
  styleUrls: ['bar-graph.component.scss']
})

export class BarGraphComponent implements OnInit {
  //Global Variable
  public counter = 0;  // set initial value
  public innerPaddingLeft = 40;
  public innerPaddingTop = 65;
  public innerPaddingRight = 10;
  public innerPaddingBottom = 55;
  // public isChange: boolean = false;
  @Input() options: DataGraphSettings;
  defaults: DataGraphSettings = {
    data: null,
    chart: {
      chartType: null,//stackedColumn
      chartProperty: [{
        barColor: null,//color field like 'red' or '#ff0000'
        YpropertyName: null,//name of class or json key 
      }],
      IndicatorsLines: [],
      showVerticalGrid: false,
    },
    canvasWidth: null,
    canvasHeight: null,
    visibleGraphWidth: null,
    visibleGraphHeight: null,
    canvas: null,
    context: null,
    verticalStepSize: null,//xPadding
    horizontalStepSize: null,//ypadding
    fontStyle: "normal",
    fontSize: "12px",
    fontName: "Helvetica Neue,Arial,sans-serif",
    xLabelValues: [], //labels to display over x axis
    RangeCount: null, //the no of blocks the chart will be divided into horizontally
    MaxRange: null,
    MinRange: null,
    gap: 1,
    stepSkipfromY: 1,
    stepSkipfromX: null,
    XLineValues: null, //
    lineColor: "#fff",
    Color: "#fff",
    backgroundcolor: null,
    xyLocation: null,
    singleYPoint: null, //size of each vertical point over canvas
    singleXPoint: null, //size of each horizontal point over canvas
    ZeroLocation: null, //x axis
    lineWidth: 1,
    classification: null
  };
  constructor(private postalChannelService: PostalChannelService) { }
  /* Initializing the component */
  ngOnInit(): void {
    this.drawActivityChart();
    this.postalChannelService.postalMessage$.subscribe((postalmsg) => {
      if (postalmsg.topic === 'CHANGES_BAR_GRAPH') {
        this.drawActivityChart();
      }
    });
  }


  /* This is the main function which calls upon the other functions to draw the complete graph */
  public drawActivityChart(): void {
    const graphSettings = Object.assign({}, this.defaults, this.options);
    if (!graphSettings.canvasWidth) {
      const canvas: any = document.getElementById('mycanvas');
      graphSettings.canvasWidth = canvas.width;
      if (graphSettings.canvasWidth <= 0) {
        graphSettings.canvasWidth = 274;
      }
    }
    if (graphSettings.canvasWidth && graphSettings.canvasWidth > 1800) {
      graphSettings.canvasWidth = graphSettings.canvasWidth - (this.innerPaddingLeft + this.innerPaddingRight + 30);
    }
    // add some additional width for single bar graph.
    if (graphSettings.data && graphSettings.data.length === 1) {
      graphSettings.canvasWidth = graphSettings.canvasWidth + 60;
    }
    // to intialize graph's common properties
    this.init(graphSettings);

    // to add canvas element to the graph's HTML page
    this.addCanvas(graphSettings);

    // to draw the y axis line
    this.drawYAxisLines(graphSettings);

    // to draw the grid lines of the chart
    this.drawHorizontalGridLines(graphSettings);

    // to draw the vertical bars of data over the canvas
    if (graphSettings.chart.chartType === 'stackedColumn') {
      this.drawBarChart(graphSettings);
    }

    // to draw the indicator lines
    this.drawIndicatorsLines(graphSettings);

    // to plot the labels on both the axis
    this.plotAxisLabels(graphSettings);
  };

  /* This function is used to initialize the common properties for graph */
  public init(graphSettings) {

    // get the values of labels for x axis from data
    graphSettings.xLabelValues[0] = this.getXAxisLabelData(graphSettings.XLineValues[0].field, graphSettings.data); // the first array of xValues should be unique
    if (graphSettings.XLineValues[1] && graphSettings.XLineValues[1].field) {
      graphSettings.xLabelValues[1] = this.getXLabelDateData(graphSettings.XLineValues[1].field, graphSettings.data);
    }


    //calculate padding for x axis
    graphSettings.verticalStepSize = parseFloat(parseFloat(((graphSettings.canvasWidth - (this.innerPaddingLeft + this.innerPaddingRight)) / graphSettings.xLabelValues[0].length).toString()).toFixed(3));
    //calculate graph's canvasWidth based on verticalStepSize
    graphSettings.visibleGraphWidth = parseFloat(parseFloat((graphSettings.xLabelValues[0].length * graphSettings.verticalStepSize).toString()).toFixed(3));

    //calculate no. of range counts on the y axis based on which horizontalStepSize can be calculated
    if (graphSettings.MinRange > graphSettings.MaxRange) {
      console.log("MinRange must be less than MaxRange!");
      return;
    }
    if (!graphSettings.gap) {
      graphSettings.RangeCount = graphSettings.MaxRange - graphSettings.MinRange;
      graphSettings.gap = 1;
    }
    else {
      graphSettings.RangeCount = (graphSettings.MaxRange - graphSettings.MinRange) / graphSettings.gap;
    }

    // calculate y padding for y axis
    graphSettings.horizontalStepSize = ((graphSettings.canvasHeight - (this.innerPaddingTop + this.innerPaddingBottom)) / graphSettings.RangeCount);
    graphSettings.singleYPoint = parseFloat((graphSettings.horizontalStepSize / graphSettings.gap).toString());

    //calculate graph's height based on horizontalStepSize
    graphSettings.visibleGraphHeight = parseFloat(parseFloat((graphSettings.RangeCount * graphSettings.horizontalStepSize).toString()).toFixed(3)) + this.innerPaddingTop;
    graphSettings.canvasHeight = graphSettings.visibleGraphHeight + this.innerPaddingBottom + this.innerPaddingTop;
    graphSettings.ZeroLocation = ((graphSettings.MaxRange / graphSettings.gap) * graphSettings.horizontalStepSize);

  }

  /* This function is used to append the canvas element to the current <div> of the graph */
  public addCanvas(graphSettings) {
    graphSettings.canvas = document.getElementById('mycanvas');
    if(graphSettings.canvas && graphSettings.canvas.width)
    {graphSettings.canvas.width = (parseInt(graphSettings.canvasWidth, 0));}
    if(graphSettings.canvas && graphSettings.canvas.height)
    {graphSettings.canvas.height = graphSettings.canvasHeight;}
    graphSettings.context = graphSettings.canvas.getContext('2d');
  }

  /* This function is used to draw the line for y axis */
  public drawYAxisLines(graphSettings) {
    graphSettings.context.beginPath();
    graphSettings.context.strokeStyle = graphSettings.lineColor;
    graphSettings.context.moveTo(this.innerPaddingLeft, this.innerPaddingTop);
    graphSettings.context.lineTo(this.innerPaddingLeft, graphSettings.visibleGraphHeight);
    graphSettings.context.stroke();
  }

  /* This function is used to draw the horizontal grid lines indicating the range */
  public drawHorizontalGridLines(graphSettings) {
    for (let y = this.innerPaddingTop; y <= graphSettings.visibleGraphHeight; y = y + graphSettings.horizontalStepSize) {
      graphSettings.context.beginPath();
      graphSettings.context.moveTo(this.innerPaddingLeft, y);
      graphSettings.context.strokeStyle = '#D3D3D3'
      graphSettings.context.lineTo(graphSettings.canvasWidth - this.innerPaddingRight, y);
      graphSettings.context.lineWidth = graphSettings.lineWidth;
      graphSettings.context.stroke();
    }
  }

  /* This function is used to draw the vertical bars indicating data */
  public drawBarChart(graphSettings) {
    for (let k = 0; k < graphSettings.chart.chartProperty.length; k++) {

      let fieldNameofY = (!graphSettings.chart.chartProperty[k].YpropertyName) ? graphSettings.YLineValues : graphSettings.chart.chartProperty[k].YpropertyName;
      let fieldNameofX = (!graphSettings.chart.chartProperty[k].XpropertyName) ? graphSettings.XLineValues[0].field : graphSettings.chart.chartProperty[k].XpropertyName;

      //calculating the pointers to draw the bars
      for (let i = 0; i < graphSettings.data.length; i++) {
        graphSettings.context.beginPath();
        let xCurrentLocation;
        let yCurrentLocation;
        let yLocationForDifferenceValue;

        if (!(graphSettings.data[i][fieldNameofX]) || (!graphSettings.data[i][fieldNameofY])) {
          continue;
        }

        let barWidth = graphSettings.verticalStepSize / 2;
        xCurrentLocation = this.getXLocation(graphSettings.data[i][graphSettings.XLineValues[0].field], graphSettings) + barWidth / 2;
        yCurrentLocation = this.innerPaddingTop + graphSettings.singleYPoint * (graphSettings.MaxRange - graphSettings.data[i][fieldNameofY]);
        let barHeight = (graphSettings.ZeroLocation - yCurrentLocation) + this.innerPaddingTop;

        graphSettings.context.fillStyle = graphSettings.chart.chartProperty[k].barColor;
        graphSettings.context.rect(xCurrentLocation, yCurrentLocation, barWidth + 20, barHeight);
        graphSettings.context.strokeStyle = '#000'
        //setting different border colors for bars based on classification
        for (const obj of graphSettings.classification) {
          if (graphSettings.data[i].classification === obj.type) {
            graphSettings.context.strokeStyle = obj.color;
            break;
          } else {
            graphSettings.context.strokeStyle = graphSettings.Color;
          }
        }
        graphSettings.context.lineWidth = 2;
        graphSettings.context.stroke();
        graphSettings.context.fill();

        //to calculate difference between orderPrice and refundPrice and display it on the bar
        const difference = graphSettings.data[i][fieldNameofY] + graphSettings.data[i]['refundPrice'];
        yLocationForDifferenceValue = this.innerPaddingTop + graphSettings.singleYPoint * (graphSettings.MaxRange - difference);
        if (fieldNameofY === 'orderPrice' && graphSettings.data[i]['refundPrice'] < 0 && difference > 0) {
          graphSettings.context.fillStyle = '#FFF';
          graphSettings.context.fill();
          graphSettings.context.rect(xCurrentLocation, yLocationForDifferenceValue, barWidth + 20, yCurrentLocation - yLocationForDifferenceValue);
          graphSettings.context.fillStyle = graphSettings.chart.chartProperty[k].barColor;
          graphSettings.context.fill();
          graphSettings.context.moveTo(xCurrentLocation, yLocationForDifferenceValue)
          graphSettings.context.lineTo(xCurrentLocation + barWidth + 20, yLocationForDifferenceValue);
          graphSettings.context.stroke();
          graphSettings.context.fillStyle = "#000";
          graphSettings.context.fillText(Math.round(difference).toLocaleString(),
            xCurrentLocation + barWidth / 2 - (graphSettings.context.measureText(graphSettings.data[i][fieldNameofY].toLocaleString()).width / 2),
            graphSettings.data[i][fieldNameofY] > 0 ? yLocationForDifferenceValue + 10 : yLocationForDifferenceValue + 14);
        } else {
          graphSettings.context.stroke();
        }

        graphSettings.context.fillStyle = "#000";
        if (fieldNameofY === 'refundPrice') {
          graphSettings.context.fillText(Math.round(graphSettings.data[i][fieldNameofY]) + ' (' + (Math.abs(graphSettings.data[i]['refundPrice'] * 100) / graphSettings.data[i]['orderPrice']).toFixed(2) + '%)',
            (xCurrentLocation + barWidth / 2 - (graphSettings.context.measureText((graphSettings.data[i][fieldNameofY]) + '(' + (Math.abs(graphSettings.data[i]['refundPrice'] * 100) / graphSettings.data[i]['orderPrice']).toFixed(2) + '%)'.toLocaleString()).width / 2)) + 7,
            graphSettings.data[i][fieldNameofY] > 0 ? yCurrentLocation - 2 : yCurrentLocation + 14);
        } else {
          // add some additional width for single bar graph.
          if (graphSettings.data && graphSettings.data.length === 1) {
            graphSettings.context.fillText(Math.round(graphSettings.data[i][fieldNameofY]).toLocaleString(),
              ((xCurrentLocation + barWidth / 2 - (graphSettings.context.measureText(graphSettings.data[i][fieldNameofY].toLocaleString()).width / 2)) + 4),
              graphSettings.data[i][fieldNameofY] > 0 ? yCurrentLocation - 2 : yCurrentLocation + 14);
          } else {
            graphSettings.context.fillText(Math.round(graphSettings.data[i][fieldNameofY]).toLocaleString(),
              xCurrentLocation + barWidth / 2 - (graphSettings.context.measureText(graphSettings.data[i][fieldNameofY].toLocaleString()).width / 2),
              graphSettings.data[i][fieldNameofY] > 0 ? yCurrentLocation - 2 : yCurrentLocation + 14);
          }
        }

      }
    }
  }

  /* This function is used to draw the indicator lines to help easily knw the range */
  public drawIndicatorsLines(graphSettings) {
    // Horizontal Line
    graphSettings.context.lineWidth = 1;
    for (let k = 0; k < graphSettings.chart.IndicatorsLines.length; k++) {
      if (graphSettings.MaxRange >= graphSettings.chart.IndicatorsLines[k]) {
        graphSettings.context.beginPath();
        let y = ((graphSettings.MaxRange - graphSettings.chart.IndicatorsLines[k]) / graphSettings.gap) * graphSettings.horizontalStepSize;
        graphSettings.context.moveTo(this.innerPaddingLeft, y + this.innerPaddingTop);
        graphSettings.context.lineTo(graphSettings.canvasWidth - this.innerPaddingRight, y + this.innerPaddingTop);
        graphSettings.context.strokeStyle = '#000000';
        graphSettings.context.lineWidth = graphSettings.lineWidth;
        graphSettings.context.stroke();
      }
    }
  }

  /* This function is used to plot the labels over the axis */
  public plotAxisLabels(graphSettings) {
    let timestart = 0;//only use when xAxisType is time
    if (graphSettings.xAxisType === "time") {
      timestart = graphSettings.xMinRange;
    }
    graphSettings.context.beginPath();
    graphSettings.context.font = graphSettings.fontStyle + " " + graphSettings.fontSize + " " + graphSettings.fontName;
    graphSettings.context.fillStyle = graphSettings.Color;

    //Plot x axis labels
    let k = graphSettings.XLineValues.length - 1;
    let i = 0;
    while (k >= 0) {
      if (graphSettings.XLineValues[k].labels.Color && graphSettings.context.fillStyle !== graphSettings.XLineValues[k].labels.Color) {
        graphSettings.context.fillStyle = graphSettings.XLineValues[k].labels.Color;
      }
      i = 0;
      for (let x = this.innerPaddingLeft; x <= (graphSettings.visibleGraphWidth + graphSettings.verticalStepSize) + this.innerPaddingLeft; x = (x + graphSettings.verticalStepSize) - ((graphSettings.verticalStepSize / 2) / 4)) {
        //setting the label along with it's marker point to display
        let xCurrentLocation;
        let xDisplayValue = "";
        xDisplayValue = graphSettings.xLabelValues[k][i];
        xCurrentLocation = x + (graphSettings.verticalStepSize / 2) / 2;
        if (xDisplayValue)
          if ((xCurrentLocation + graphSettings.context.measureText(graphSettings.xLabelValues[k][i]).width / 2) <= graphSettings.canvasWidth) {

            graphSettings.context.beginPath();
            let textWidth = graphSettings.verticalStepSize / 2;

            //setting different border colors around labels based on classification
            for (const obj of graphSettings.classification) {
              if (graphSettings.data[i].classification === obj.type) {
                graphSettings.context.strokeStyle = obj.color;
                break;
              } else {
                graphSettings.context.strokeStyle = graphSettings.Color;
              }
            }

            graphSettings.context.lineWidth = 3;

            //to display the labels above the graph 
            graphSettings.context.textAlign = 'center';
            if (graphSettings.view === 'responsible') {
              graphSettings.context.translate(xCurrentLocation + 35, (this.innerPaddingTop - 40) + (k * 15));
            } else {
              graphSettings.context.translate(xCurrentLocation + 35, (this.innerPaddingTop - 35) + (k * 15));
            }

            graphSettings.context.rotate(75);
            graphSettings.context.fillText(xDisplayValue, 0, 0);
            graphSettings.context.setTransform(1, 0, 0, 1, 0, 0);

            //to display the labels below the graph 
            graphSettings.context.globalCompositeOperation = "source-over";
            graphSettings.context.textAlign = 'center';
            if (graphSettings.view === 'responsible') {
              graphSettings.context.translate(xCurrentLocation + 35, graphSettings.visibleGraphHeight + (this.innerPaddingBottom) + (k * 15));
            } else {
              graphSettings.context.translate(xCurrentLocation + 35, graphSettings.visibleGraphHeight + (this.innerPaddingBottom + 8) + (k * 15));
            }

            graphSettings.context.rotate(75);
            graphSettings.context.fillText(xDisplayValue, 0, 0);
            graphSettings.context.setTransform(1, 0, 0, 1, 0, 0);

            //to draw rectangular border around the labels(above Bar graph)
            graphSettings.context.rect(xCurrentLocation, ((this.innerPaddingTop - 40) / 2) - 10, textWidth + 20, 50);
            graphSettings.context.stroke();
            //to draw rectangular border around the labels(below Bar graph)
            graphSettings.context.rect(xCurrentLocation, graphSettings.visibleGraphHeight + ((this.innerPaddingBottom) / 2) + 6, textWidth + 20, 50);
            graphSettings.context.stroke();
          }
        i++;
      }
      k--;
    }

    //Plot y axis labels
    let j = graphSettings.MaxRange;
    graphSettings.context.fillStyle = "black";
    graphSettings.context.textAlign = "start";
    for (let y = this.innerPaddingTop; y <= graphSettings.visibleGraphHeight; y += graphSettings.horizontalStepSize) {
      graphSettings.context.fillText(this.nFormatter(j), this.innerPaddingLeft / 4, y + 2);
      j -= graphSettings.gap;
    }
  }

  /* This function is used to get the marker point for data */
  public getXLocation(xValue, graphSettings) {
    let xPosition = 0;
    let k = 0;
    for (var x = this.innerPaddingLeft; x <= graphSettings.canvasWidth - this.innerPaddingRight; x = (x + graphSettings.verticalStepSize) - ((graphSettings.verticalStepSize / 2) / 4)) {
      if (graphSettings.xLabelValues[0][k] === xValue) {
        xPosition = x;
        break;
      }
      k++;
    }
    return xPosition;
  }

  /* This function is used to process and return an array of unique values needed to display as labels on x axis*/
  public getXAxisLabelData(key, data) {
    const xArray = [];
    data.forEach(element => {
      if (!xArray.includes(element[key])) {
        xArray.push(element[key]);
      }
    });
    return xArray;
  }

  /*  This function is used to process and return an array of values needed to display as labels on x axis if the data is of type date */
  public getXLabelDateData(key, data) {
    const xArray = [];
    data.forEach(element => {
      if (element[key]) {
        let displayDate = new Date(element[key]);
        let StringDisplayDate = (displayDate.getMonth() + 1) + "/" + displayDate.getDate() + "/" + displayDate.getFullYear().toString().substr(-2)
        xArray.push(StringDisplayDate);
      } else {
        xArray.push('');
      }
    });
    return xArray;
  }

  /* This function is used to format the long digit numbers */
  public nFormatter(num: any) {
    let isNegative = false
    if (num < 0) {
      isNegative = true
    }
    let formattedNumber: any = 0;
    num = Math.abs(num)
    if (num >= 1000000000) {
      formattedNumber = (num / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
    } else if (num >= 1000000) {
      formattedNumber = (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
    } else if (num >= 1000) {
      formattedNumber = (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    } else {
      formattedNumber = num;
    }
    if (isNegative) { formattedNumber = '-' + formattedNumber }
    return formattedNumber;
  }
}