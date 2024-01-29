import { formatDate } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';
import { DropDownTreeComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ExcelService, PdfService, ScrollbarDirective, UIModalNotificationPage } from 'global';
import { Observable, Subscription } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { MatTablePaginatorComponent } from 'src/app/shared/components/mat-table-paginator/mat-table-paginator.component';
import { globalSharedService } from 'src/app/shared/services/global/globalSharedService';
import { AlarmDataService } from '../../../services/alarm-data.service';
@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit, OnDestroy {
  @ViewChild(UIModalNotificationPage) modelNotification;
  @ViewChild('myPaginatorChildComponent') myPaginatorChildComponent: MatTablePaginatorComponent;
  @ViewChild(ScrollbarDirective) directiveRef?: ScrollbarDirective;
  displayedColumns: string[] = ['entityTypeName', 'entityName', 'eventDateTime', 'alarmTypeName', 'eventDataValue', 'stateName', 'alarmSeverityName', 'edit'];
  displayTableHeader = ['Asset', 'Event Entity', 'Event Time', 'Event Type', 'Event Value', 'Event State', 'Severity'];
  filterExpandCollapse = "Click to Show Filter";
  @ViewChild('defaultCheck')
  public ddTreeObj: DropDownTreeComponent;
  @ViewChild('check')
  public checkboxObj: CheckBoxComponent;
  currentTime: any;
  config: any;
  noRerocrdFound = false;
  curDate: string;
  isDisabled;
  todayDate: { month: number; day: number; year: number; };
  minDate: { month: number; day: number; year: number; };
  endDate: { month: number; day: number; year: number; };
  validateTime = false;
  alarmForm: FormGroup;
  validTime: boolean;
  dataSource: any;
  selectedAsset;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  sort;
  fileName: string;
  showLoaderImage: boolean = false;
  toggleFilterSearch: boolean = false;
  show: boolean = false;
  //alarmClearedValue: AlarmDataModel[];
  alarmStates: any[];
  alarmSeveritys: any[];
  alarmTypes: any[];
  alarmFormData: any;
  eventActionId: any;
  alarmEvent: any;
  assets: any[];
  totalAlarmData: any[];
  selectedAlarmStateItems: any[] = [];
  selectedAlarmSeverityItems: any[] = [];
  selectedAssetItems: any[] = [];
  alarmSeveritysForMultiSelect: any[];
  alarmStatesForMultiSelect: any[];
  settings = {};
  assetSettings = {};
  assetsForMultiSelect: any[] = [];
  assetTags: any[] = [];
 /*  filteredAlarmListWithAlarmState: any[] = [];
  filteredAlarmListWithAlarmSeverity: any[] = [];
  filteredAlarmListWithAssetTags: any[] = [];
  filteredAlarmListWithStartAndEndDates: any[] = []; */
  finalListOfFilteredAlarmData: Set<any> = new Set<any>();
  alarmStateIds: any[] = [];
  alarmSeverityIds: any[] = [];
  endDateTime: number;
  startDateTime: number;
  subscribe: Subscription;
  timeInterval: any;
  masterMapOfAlarmData = new Map<number, any>();
  latestAlarmEventTime: any;
  enableViewButton: boolean = false;
  clearTheSearch: boolean = true;
  engUnits: any[] = [];
  startDateandTime: string;
  endDateAndTime: string;
  validateEndTime: boolean;
  userType: string;
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
   public treeSettings: Object = { autoCheck: true }
   public sortDropDown:string ='Ascending';
  constructor(private formBuilder: FormBuilder, private alarmDataService: AlarmDataService,
    private globalService: globalSharedService,
    config: NgbTimepickerConfig, private excelService: ExcelService, private pdfService: PdfService
  ) {
    setInterval(() => { this.currentTime = new Date().getHours() + ':' + new Date().getMinutes() }, 1);
    config.spinners = false;
  }
  ngOnInit() {
    this.getUserType();
    this.dataSource = new MatTableDataSource();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.entityTypeName.toLowerCase().includes(filter)
        || data.entityName.toLowerCase().includes(filter)
        || data.eventDateTime.toLowerCase().includes(filter)
        || data.alarmTypeName.toLowerCase().includes(filter)
        || data.eventDataValue.toLowerCase().includes(filter)
        || data.alarmSeverityName.toLowerCase().includes(filter)
        || data.alarmStateName.toLowerCase().includes(filter);
    };
    this.loadForm();
    this.getEnggUnits();
    this.getAlarmSeveritys();
    this.getAlarmStates();
    this.getAlarmTypes();
    this.getTableResponse();
    this.getAssetList();
  }
  getUserType() {
    let isAdmin=sessionStorage.getItem("isAdmin");
    if(isAdmin=='true'){
      this.userType='Admin';
    }
  }
  loadDataForTimeInterval() {
    let beId = parseInt(sessionStorage.getItem('beId'));
    let userId = parseInt(sessionStorage.getItem('userId'));
    let targetTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.alarmDataService.getTimeIntervalsFromFile().toPromise().then(data => {
    this.timeInterval = data.eventTimeInterval;
    this.subscribe = Observable
      .interval(this.timeInterval)
      .pipe(flatMap(() => this.alarmDataService.getIncrementalAlarmData(beId, targetTimeZone, this.latestAlarmEventTime, userId,this.userType))
      ).subscribe(res => {
        if (Array.isArray(res) && res.length != 0) {
          res = res.sort((a, b) => b.eventTime - a.eventTime);
          this.latestAlarmEventTime = res[0].eventTime;
          this.updateTheMasterMap(res);
        }
      })
    })
  }
  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
    }
  }
  updateTheMasterMap(res: any[]) {
    res.forEach(al => {
      al = this.setAllInfoToAlarm(al);
      this.totalAlarmData.push(al)
    })
    res = [];
    res = this.totalAlarmData;
    res = res.sort((a, b) => b.eventTime - a.eventTime);
    this.totalAlarmData = res;
    if (res && res.length != 0) {
      if (this.clearTheSearch) {
        this.latestAlarmEventTime = res[0].eventTime;
        this.noRerocrdFound = false;
        this.dataSource.data = res;
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;
        this.showLoaderImage = false;
      }
    } else {
      this.dataSource.data = [];
      this.showLoaderImage = false;
      this.noRerocrdFound = true;
    }
  }
  setAllInfoToAlarm(alarm: any): any {
    this.alarmTypes.forEach(type => {
      if (alarm.typeId == type.id) {
        alarm.alarmTypeName = type.name
      }
    })
    this.alarmSeveritys.forEach(severity => {
      if (alarm.severityId == severity.id) {
        alarm.alarmSeverityName = severity.name;
      }
    })
    this.alarmStates.forEach(state => {
      if (alarm.stateId == state.id) {
        alarm.alarmStateName = state.name;
      }
    })
    this.engUnits.forEach(unit => {
      if (unit.id == alarm.unitId) {
        alarm.conditionValue = alarm.conditionValue + ' ' + unit.name;
        alarm.dataValue = alarm.dataValue + ' ' + unit.name;
        if (null != alarm.eventDataValue) {
          alarm.eventDataValue = alarm.eventDataValue + ' ' + unit.name;
        }
      }
    })
    return alarm;
  }
  loadForm() {
    this.alarmForm = this.formBuilder.group({
      assetIds: [[]],
      startDate: [null],
      endDate: [null],
      startTime: [''],
      endTime: [''],
      alarmSeverityIds: [[]],
      alarmStateIds: [[]]
    });
    this.alarmForm.controls['endDate'].valueChanges.subscribe(data => {
      if (!data || (typeof data === 'string' && data.length == 0)) {
        this.alarmForm.patchValue({
          endDate: null
        }, { emitEvent: false });
      }
    });
    this.alarmForm.controls['startDate'].valueChanges.subscribe(data => {
      if (!data || (typeof data === 'string' && data.length == 0)) {
        this.alarmForm.patchValue({
          startDate: null
        }, { emitEvent: false });
      }
    });
    this.futureDateDisabled();
    this.settings = {
      enableSearchFilter: true,
      text: $localize`:@@multiSelectDropdown.select:--Select--`,
      selectAllText: $localize`:@@multiSelectDropdown.selectAll:Select All`,
      unSelectAllText: $localize`:@@multiSelectDropdown.unSelectAll:UnSelect All`,
      classes: "myclass custom-class",
      badgeShowLimit: 0,
    };
    this.patchDates();
    this.futureDateDisabled();
  }
  refreshTableListFunction() {
    this.dataSource.data = []
    this.getTableResponse();
  }
  onItemSelectAlarmState(item: any) {
    this.selectedAlarmStateItems.push(item);
    this.onClickOfFilterFields();
  }
  OnItemDeSelectAlarmState(item: any) {
    this.selectedAlarmStateItems=this.selectedAlarmStateItems.filter(obj => obj !== item);
    this.onClickOfFilterFields();
  }
  onSelectAllAlarmState(items: any) {
    this.selectedAlarmStateItems = items;
    this.onClickOfFilterFields();
  }
  onDeSelectAllAlarmState(items: any) {
    this.selectedAlarmStateItems = [];
    this.onClickOfFilterFields();
  }
  onItemSelectAlarmSeverity(item: any) {
    this.selectedAlarmSeverityItems.push(item);
    this.onClickOfFilterFields();
  }
  OnItemDeSelectAlarmSeverity(item: any) {
    this.selectedAlarmSeverityItems=this.selectedAlarmSeverityItems.filter(obj => obj !== item);
    this.onClickOfFilterFields();
  }
  onSelectAllAlarmSeverity(items: any) {
    this.selectedAlarmSeverityItems = items;
    this.onClickOfFilterFields();
  }
  onDeSelectAllAlarmSeverity(items: any) {
    this.selectedAlarmSeverityItems = [];
    this.onClickOfFilterFields();
  }
  requiredFormat(items) {
    const that = this;
    return items && items.length ? items.map(function (o) {
      var returnObj = {
        "id": o.id,
        "itemName": o.name
      }
      return returnObj;
    }) : [];
  }
  getAlarmDataBySearchFields() {
    this.noRerocrdFound = false;
    let startDate = this.getStartDateTime();
    let endDate = this.getEndDateTime();
    this.getSearchFeildsAndFilterTheData(startDate, endDate);

    this.searchFilterObject = {};
    if (this.alarmForm.value.assetIds.length) {
      this.searchFilterObject['Asset'] = this.selectedAsset;
    } else {
      delete this.searchFilterObject['Asset'];
    }

    if (startDate != undefined || startDate != null) {
      this.searchFilterObject['Start Date/Time'] = this.startDateandTime;
    } else {
      delete this.searchFilterObject['Start Date/Time'];
    }

    if (endDate != undefined || endDate != null) {
      this.searchFilterObject['End Date/Time'] = this.endDateAndTime;
    } else {
      delete this.searchFilterObject['End Date/Time'];
    }
    if (this.selectedAlarmSeverityItems.length) {
      this.searchFilterObject['Alarm Severity'] = this.selectedAlarmSeverity.slice(0, -2);
    } else {
      delete this.searchFilterObject['Alarm Severity'];
    }
    if (this.selectedAlarmStateItems.length) {
      this.searchFilterObject['Alarm State'] = this.selectedAlarmState.slice(0, -2);
    } else {
      delete this.searchFilterObject['Alarm State'];
    }
    this.csvOptions.title = this.globalService.formateCSVTitle(this.searchFilterObject, "Events Report");
  }
  selectedAlarmSeverity = '';
  selectedAlarmState = '';
  selectedAssetData = '';
  getSearchFeildsAndFilterTheData(startDateTime, endDateTime) {
    this.finalListOfFilteredAlarmData.clear();
    let assetTags = []
    let assetIds = [];
    if (null != this.ddTreeObj.value && this.ddTreeObj.value != undefined) {
      this.ddTreeObj.value.forEach(id => {
        assetIds.push(this.parseInt(id))
      })
    }
    this.alarmFormData = <any>this.alarmForm.value;

    this.selectedAssetData = '';
    this.selectedAsset = '';
    for (let i = 0; i < this.assetsForMultiSelect.length; i++) {
      for (let object of this.assetsForMultiSelect) {
        if (object.id == this.alarmForm.value.assetIds[i]) {
          this.selectedAssetData += object.name + ', ';
          this.selectedAsset = this.selectedAssetData.slice(0, -2);
        }
      }
    }
    this.alarmStateIds = [];
    this.alarmSeverityIds = [];
    this.selectedAlarmSeverity = '';
    if (this.selectedAlarmSeverityItems.length) {
      this.selectedAlarmSeverityItems.forEach(e => {
        this.alarmSeverityIds.push(e.id);
        this.selectedAlarmSeverity += e.itemName + ', ';
      });
    }
    this.selectedAlarmState = '';
    if (this.selectedAlarmStateItems.length) {
      this.selectedAlarmStateItems.forEach(e => {
        this.alarmStateIds.push(e.id);
        this.selectedAlarmState += e.itemName + ', ';
      });
    }
    let severityIds = this.alarmSeverityIds.map(x => x).join(",");
    let stateIds = this.alarmStateIds.map(x => x).join(",");
    let assets = assetIds.map(x => x).join(",");
    let beId = parseInt(sessionStorage.getItem('beId'));
    let userId = parseInt(sessionStorage.getItem('userId'));
    let targetTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.showLoaderImage = true;
    this.dataSource.data = [];
    this.alarmDataService.getAlarmDataByBeIdTimeZoneAndSearchFeilds(beId, targetTimeZone,
      startDateTime, endDateTime, assets, severityIds, stateIds, userId).subscribe(res => {
        if (null != res && Array.isArray(res) && res.length) {
          res.forEach(event => {
            event = this.setAllInfoToAlarm(event);
          })
          res = res.sort((a, b) => b.eventTime - a.eventTime)
          this.showLoaderImage = false;
          this.dataSource.data = res;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        } else {
          this.showLoaderImage = false;
          this.noRerocrdFound = true;
        }
      })
  }
  createDataSourceObject(res: any[]): any[] {
    res.forEach(alarm => {
      alarm = this.setAllInfoToAlarm(alarm);
    })
    return res
  }
  getTableResponse() {
    this.noRerocrdFound = false;
    this.showLoaderImage = true;
    let beId = parseInt(sessionStorage.getItem('beId'));
    let userId = parseInt(sessionStorage.getItem('userId'));
    let targetTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let startDateTime = this.getStartDateTime();
    let endDateTime = this.getEndDateTime();
    this.totalAlarmData = [];
    this.alarmDataService.getEventsByOrganizationId(beId, targetTimeZone,
      startDateTime, endDateTime,this.userType, userId).subscribe(res => {
        if (null != res && Array.isArray(res) && res.length) {
          res = this.createDataSourceObject(res);
          res = res.sort((a, b) => b.eventTime - a.eventTime)
          this.latestAlarmEventTime = res[0].eventTime;
          this.totalAlarmData = res;
          this.showLoaderImage = false;
          this.dataSource.data = res;
          this.myPaginator = this.myPaginatorChildComponent.getDatasource();
          this.matTablePaginator(this.myPaginator);
          this.dataSource.paginator = this.myPaginator;
          this.dataSource.sort = this.sort;
        } else {
          this.latestAlarmEventTime = startDateTime;
          this.showLoaderImage = false;
          this.noRerocrdFound = true;
        }
      })
  }
  getEndDateTime() {
    let endTime = null
    let endDateTime = null;
    let endDate = this.fetchEndDateFromPickerForApiCall();
    if (null != endDate) {
      endTime = this.alarmForm.value.endTime
      if (endTime === 'endTime' || endTime == undefined) {
        endTime = '';
      }
      if (endTime.length == 0) {
        let endDateTdy = new Date();
        var year = endDateTdy.getFullYear();
        var month = endDateTdy.getMonth() + 1;
        let mth, d, totaldate;
        if (month <= 9) {
          mth = '0' + month;
        } else {
          mth = month
        }
        var day = endDateTdy.getDate();
        if (day <= 9) {
          d = '0' + day;
        } else {
          d = day;
        }
        totaldate = year + '-' + mth + '-' + d
        if (endDate !== totaldate) {
          endTime = '23:59:59';
        } else {
          var hours = endDateTdy.getHours();
          let hr;
          var minutes = endDateTdy.getMinutes();
          let min;
          if (hours <= 9) {
            hr = '0' + hours;
          } else {
            hr = hours
          }
          if (minutes <= 9) {
            min = '0' + minutes;
          } else {
            min = minutes;
          }
          let currentTime = hr + ":" + min + ":59";
          endTime = currentTime
        }
      } else {
        endTime = endTime + ':00'
      }
      endDate = endDate + 'T' + endTime;
      endDateTime = new Date(endDate).getTime();
    } else {
      endDateTime = new Date().getTime();
    }

    if (endDate != undefined || endDate != null) {
      this.endDateAndTime = this.globalService.startDateEndDateTimeSplit(endDate);
    }

    return endDateTime
  }

  getStartDateTime() {
    let startDate = this.fetchStartDateFromPickerForApiCall();
    let startDateTime = null;
    let startTime = null;
    if (null != startDate) {
      startTime = this.alarmForm.value.startTime
      if (startTime === 'startTime' || startTime == undefined) {
        startTime = ''
      }
      if (startTime.length == 0) {
        startTime = '00:00:00'
      } else {
        startTime = startTime + ':00'
      }
      startDate = startDate + 'T' + startTime;
      startDateTime = new Date(startDate).getTime();
    } else {
      startDateTime = 0;
    }

    // Format CSV title
    if (startDate != undefined || startDate != null) {
      this.startDateandTime = this.globalService.startDateEndDateTimeSplit(startDate);
    }
    return startDateTime;
  }
  getAlarmStates() {
    this.alarmDataService.getAlarmStates().subscribe(res => {
      if (null != res) {
        res = res.sort((a, b) => a.id - b.id);
      }
      this.alarmStates = res;
      this.alarmStatesForMultiSelect = this.requiredFormat(res);
    },
      error => {
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      }
    )
  }
  getEnggUnits() {
    this.alarmDataService.getEnggUnits().subscribe(res => {
      this.engUnits = res;
    },
      error => {
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      })
  }
  getAlarmSeveritys() {
    this.alarmDataService.getAlarmSeveritys().subscribe(res => {
      this.alarmSeveritys = res;
      this.alarmSeveritysForMultiSelect = this.requiredFormat(res);
    },
      error => {
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      })
  }
  getAlarmTypes() {
    this.alarmDataService.getAlarmTypes().subscribe(res => {
      this.alarmTypes = res;
    },
      error => {
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      })
  }
  addMinDateValue() {
    let startDate = this.fetchStartDateFromPicker();
    if (null != startDate) {
      let fullDate = startDate.split('/');
      this.minDate =
      {
        month: parseInt(fullDate[0]),
        day: parseInt(fullDate[1]),
        year: parseInt(fullDate[2]),
      }
    }
    this.onClickOfFilterFields();
  }
  endTime:any = new FormControl('endTime', (control: FormControl) => {
    const value = control.value;
    if (!value) {
      return { required: true };
    }
    return null;
  });
  startTime:any = new FormControl('startTime', (control: FormControl) => {
    const value = control.value;
    if (!value) {
      return { required: true };
    }
    return null;
  });
  getAssetList() {
    let beId = this.parseInt(sessionStorage.getItem("beId"));
    this.alarmDataService.getAssetList(beId).subscribe(data => {
      this.assets = data;
      this.assets = this.assets.sort((a, b) => a.name.localeCompare(b.name))
      data.forEach(asset => {
        if (null != asset.subAssets && asset.subAssets.length != 0) {
          asset.hasChild = true;
          this.iterateTheSubList(asset.subAssets)
        }
      })
      this.assetsForMultiSelect = this.getFormattedAssetList(data);
      this.field = this.formatedResponse(this.assetsForMultiSelect);
    },
      error => {
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
      })
  }
  formatedResponse(response) {
    return this.field = {
      dataSource: response,
      value: 'id',
      parentValue: 'refAssetId',
      text: 'name',
      hasChildren: 'hasChild',
      selected: 'isSelected'
    };
  }
  assetIterate(assets) {
    const that = this;
    return assets && assets.length ? assets.map(function (o) {
      var returnObj = {
        "id": o.id,
        "name": o.name,
        "refAssetId": o.refAssetId,
        "child": that.assetIterate(o.subAssets),
      }
      if (o.refAssetId) {
        returnObj["refAssetId"] = o.refAssetId;
      }
      return returnObj;
    }) : [];
  }
  getFormattedAssetList(list) {
    const that = this;
    return list.map(function (l) {
      return {
        id: l.id,
        name: l.name,
        child: that.assetIterate(l.subAssets),
      };
    });
  }
  public selectedNodes = []
  field: Object = {};
  public showCheckBox = true;
  public mode = 'Delimiter';
  public allowMultiSelection: boolean = true;
  public allowFiltering: boolean = true;
  public filterBarPlaceholder: string = 'Search...';
  public onChange(): void {
    this.onClickOfFilterFields();
  }
  onClickOfFilterFields() {
    let startDate = this.fetchStartDateFromPickerForApiCall();
    let endDate = this.fetchEndDateFromPickerForApiCall();
    if (this.ddTreeObj.value.length != 0 || this.selectedAlarmStateItems.length != 0 ||
      this.selectedAlarmSeverityItems.length != 0 || startDate != null || endDate != null) {
      this.enableViewButton = false;
    } else {
      this.enableViewButton = true;
    }
  }
  requiredFormatForAsset(items) {
    const that = this;
    return items && items.length ? items.map(function (o) {
      var returnObj = null;
      returnObj = {
        "id": o.id,
        "itemName": o.name,
      }
      return returnObj;
    }) : [];
  }
  iterateTheSubList(subAssets: any[]) {
    const that = this;
    subAssets.forEach(asset => {
      if (null != asset.subAssets && asset.subAssets.length != 0) {
        asset.hasChild = true;
        this.iterateTheSubList(asset.subAssets)
      }
    })
  }
  patchDates() {
    let endDate = new Date();
    let startDate = formatDate(endDate, 'MM/dd/yyyy', 'en');
    let arrayDate = startDate.split('/');
    let fullDate = {
      month: parseInt(arrayDate[0]),
      day: parseInt(arrayDate[1]),
      year: parseInt(arrayDate[2])
    }
    this.alarmForm.patchValue({
      startDate: fullDate,
      endDate: fullDate,
    })
  }
  parseInt(id) {
    if (isNaN(id)) {
      return id;
    }
    return parseInt(id);
  }
  resetForm() {
    this.loadForm();
    this.selectedAlarmSeverityItems.length = 0;
    this.selectedAlarmStateItems.length = 0;
    this.onClickOfFilterFields();
    this.ddTreeObj.value.length = 0
    this.clearTheSearch = true;
    this.enableViewButton = false;
    let res = [];
    this.updateTheMasterMap(res);
    this.validateTime = false;
    this.validateEndTime = false;
  }
  futureDateDisabled() {
    this.curDate = formatDate(new Date(), 'MM/dd/yyyy', 'en');
    let fullDate = this.curDate.split('/');
    this.todayDate =
    {
      month: parseInt(fullDate[0]),
      day: parseInt(fullDate[1]),
      year: parseInt(fullDate[2])
    }
    this.minDate = this.todayDate;
    this.endDate = this.todayDate
  }
  fetchEndTimeFromTimePicker() {
    let hours = this.endTime.value.hour;
    if (hours <= 9) {
      hours = '0' + hours
    }
    let minutes = this.endTime.value.minute;
    if (minutes <= 9) {
      minutes = '0' + minutes
    }
    return hours + ':' + minutes
  }
  fetchStartTimeFromTimePicker() {
    let hours = this.startTime.value.hour;
    if (hours <= 9) {
      hours = '0' + hours
    }
    let minutes = this.startTime.value.minute;
    if (minutes <= 9) {
      minutes = '0' + minutes
    }
    return hours + ':' + minutes
  }
  fetchStartDateFromPickerForApiCall() {
    if (null != this.alarmForm.value.startDate) {
      let newDay = this.alarmForm.value.startDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.alarmForm.value.startDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let newYrs = this.alarmForm.value.startDate.year;
      let reqDateOfBirth = newYrs + '-' + newMon + '-' + newDay;
      return reqDateOfBirth;
    }
  }
  fetchStartDateFromPicker() {
    if (null != this.alarmForm.value.startDate) {
      let newYrs = this.alarmForm.value.startDate.year;
      let newDay = this.alarmForm.value.startDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.alarmForm.value.startDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let reqDateOfBirth = newMon + '/' + newDay + '/' + newYrs;
      return reqDateOfBirth;
    }
  }
  fetchEndDateFromPickerForApiCall() {
    if (null != this.alarmForm.value.endDate) {
      let newDay = this.alarmForm.value.endDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.alarmForm.value.endDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let newYrs = this.alarmForm.value.endDate.year;
      let reqDateOfBirth = newYrs + '-' + newMon + '-' + newDay;
      return reqDateOfBirth;
    }
  }
  fetchEndDateFromPicker() {
    if (null != this.alarmForm.value.endDate) {
      let newDay = this.alarmForm.value.endDate.day;
      if (newDay <= 9) {
        newDay = '0' + newDay;
      }
      let newMon = this.alarmForm.value.endDate.month;
      if (newMon <= 9) {
        newMon = '0' + newMon;
      }
      let newYrs = this.alarmForm.value.endDate.year;
      let reqDateOfBirth = newMon + '/' + newDay + '/' + newYrs;
      return reqDateOfBirth;
    }
  }
  validateFromDate() {
    this.onClickOfFilterFields();
    if (this.alarmForm.value.startDate != null && this.alarmForm.value.endDate != null) {
      let startDay = this.alarmForm.value.startDate.day;
      let endDay = this.alarmForm.value.endDate.day;
      if (startDay > endDay) {
        this.alarmForm.patchValue({
          startDate: this.fetchStartDateFromPicker()
        }, { emitEvent: false });
      }
      let endMonth = this.alarmForm.value.endDate.month;
      let startMonth = this.alarmForm.value.startDate.month;
      if (endMonth > startMonth) {
        this.alarmForm.patchValue({
          startDate: this.fetchStartDateFromPicker()
        }, { emitEvent: false });
      }
    } else if (this.alarmForm.value.endDate == null || this.alarmForm.value.startDate == null) {
      this.futureDateDisabled();
    }
  }
  validateFromStartFromEndDate() {
    let date = this.fetchEndDateFromPicker()
    if (null != date) {
      let fullDate = date.split('/');
      this.endDate =
      {
        month: parseInt(fullDate[0]),
        day: parseInt(fullDate[1]),
        year: parseInt(fullDate[2]),
      }
      this.addMinDateValue();
    }
    this.onClickOfFilterFields();
  }
  changeStartDate(event: any) {
    this.validateStartAndEndTime('startTime');
  }
  changeEndDate(event: any) {
    this.validateStartAndEndTime('endTime');
  }
  resetTimeValidationControlls() {
    this.validateTime = false;
    this.validateEndTime = false;
    this.alarmForm.controls['startTime'].markAsUntouched()
    this.alarmForm.controls['startTime'].markAsPristine()
    this.alarmForm.controls['startTime'].updateValueAndValidity();
    this.alarmForm.controls['endTime'].markAsUntouched()
    this.alarmForm.controls['endTime'].markAsPristine()
    this.alarmForm.controls['endTime'].updateValueAndValidity();
  }
  validateStartAndEndTime(id:any) {
    this.resetTimeValidationControlls()
    let startDate = this.fetchStartDateFromPicker()
    let endDate = this.fetchEndDateFromPicker()
    if (startDate === endDate) {
      let startTime = this.alarmForm.value.startTime
      let endTimeTime = this.alarmForm.value.endTime
      let strtHr, strtMin, endHr, endMin
      if (startTime.length != 0) {
        let startTimeArray = startTime.split(':')
        strtHr = parseInt(startTimeArray[0]);
        strtMin = parseInt(startTimeArray[1]);
      }
      if (endTimeTime.length != 0) {
        let endTimeTimeArray = endTimeTime.split(':')
        endHr = parseInt(endTimeTimeArray[0]);
        endMin = parseInt(endTimeTimeArray[1]);
      }
      if (id == 'startTime') {
        if (strtHr >= endHr) {
          if (strtMin >= endMin) {
            this.validateTime = true
          this.alarmForm.controls['startTime'].markAsTouched();
          this.alarmForm.controls['startTime'].updateValueAndValidity();
          this.alarmForm.controls['startTime'].setErrors({
            'required': true
          })
          } if (strtHr > endHr) {
            this.validateTime = true
          this.alarmForm.controls['startTime'].markAsTouched();
          this.alarmForm.controls['startTime'].updateValueAndValidity();
          this.alarmForm.controls['startTime'].setErrors({
            'required': true
          })
          }
        }
      }
      else if (id == 'endTime') {
        if (strtHr >= endHr) {
          if (strtMin >= endMin) {
            this.validateEndTime = true
            this.alarmForm.controls['endTime'].markAsTouched();
            this.alarmForm.controls['endTime'].updateValueAndValidity();
            this.alarmForm.controls['endTime'].setErrors({
              'required': true
            })
          } if (strtHr > endHr) {
            this.validateEndTime = true
            this.alarmForm.controls['endTime'].markAsTouched();
            this.alarmForm.controls['endTime'].updateValueAndValidity();
            this.alarmForm.controls['endTime'].setErrors({
              'required': true
            })
          }
        }
      }
    }
  }
  filterSearchBox() {
    this.toggleFilterSearch = !this.toggleFilterSearch;
    if (this.toggleFilterSearch) {
      this.filterExpandCollapse = "Click to Hide Filter";
    } else {
      this.filterExpandCollapse = "Click to Show Filter";
    }
  }
  actionChange(element: any, alarmData: any) {
    this.alarmEvent = {};
    this.alarmEvent['alarmState'] = this.parseInt(alarmData.eventId);
    this.alarmEvent.alarmId = element.id;
    this.alarmEvent.alarmEntityId = element.entityId;
    this.alarmEvent.alarmConfigId = element.configId;
    this.modelNotification.inputField = true;
    this.modelNotification.swalWarningAlarm('Do you want change the state of alarm');
  }
  sendStateEvent(remark) {
    this.alarmEvent.remark = remark;
    this.alarmEvent.alarmEventTime = new Date().getTime();
    this.alarmEvent.alarmEventUserId = this.parseInt(sessionStorage.getItem('userId'))

    this.alarmDataService.saveAlarmEvent(this.alarmEvent).subscribe(res => {

      this.modelNotification.alertMessage(res['messageType'], res['message']);
    }, error => {
      this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
    })
  }
  expand: any = false;
  panelExpandCollapseEmitter(event) {
    this.expand = event;
  }
  /*
     Download as Excel, PDF, CSV starts here=================================
   */
  // Getting search filter details
  searchFilterObject = {};
  searchFieldsContainer;
  searchFilterKeysValues
  searchCriteriaText = "Search Criteria";
  exportedFileTitleName = "Events Report";
  tableBodyDataList;
  xlsxOptions = {
    headers: this.displayTableHeader
  }
  csvOptions = {
    fieldSeparator: ',',
    quoteStrings: '"',
    decimalseparator: '.',
    showLabels: true,
    showTitle: true,
    title: 'Events Report',
    useBom: true,
    noDownload: false,
    headers: this.displayTableHeader
  };
  downloadFile(fileType) {
    // Search filter details
    this.searchFilterKeysValues = Object.entries(this.searchFilterObject);
    this.searchFieldsContainer = {
      "searchFilterKeysValues": this.searchFilterKeysValues,
      "searchCriteriaText": this.searchCriteriaText
    }
    // Make new set of re-create object
    this.tableBodyDataList = this.globalService.reCreateNewObject(this.dataSource.data, this.displayedColumns);

    this.tableBodyDataList = this.tableBodyDataList.map(object => {
      return this.globalService.removeLastIndexAtArray(object);
    });

    // CSV/PDF/Excel file name
    this.fileName = this.globalService.getExportingFileName("Events");
    let exportFile = {
      "fileName": this.fileName,
      "excelWorkSheetName": this.exportedFileTitleName,
      "title": this.exportedFileTitleName,
      "tableHeaderNames": this.xlsxOptions.headers,
      'tableBodyData': this.tableBodyDataList
    }
    // Final download
    this.globalService.downloadFile(fileType, exportFile, this.searchFieldsContainer,
      this.tableBodyDataList, this.fileName, this.csvOptions);
  }
  /*
  Download as Excel, PDF, CSV ends here=================================
*/
  /*
    Material table paginator code starts here
  */
  myPaginator;
  pageIndex: number;
  pageSize: number;
  length: number;
  /*
      Material pagination getting pageIndex, pageSize, length through
      events(On change page, Next,Prev, Last, first) */
  matTablePaginator(myPaginator) {
    this.pageIndex = myPaginator.pageIndex;
    this.pageSize = myPaginator.pageSize;
    this.length = myPaginator.length;
  }
  /* Load table data always to the Top of the table
  when change paginator page(Next, Prev, Last, First), Page size  */
  onPaginateViewScrollToTop() {
    if(this.directiveRef){
      this.directiveRef.scrollToTop();
      this.directiveRef.update();
    }
  }
  /*
    Material table paginator code ends here
  */
 nodeChecked(event){
 }
}
