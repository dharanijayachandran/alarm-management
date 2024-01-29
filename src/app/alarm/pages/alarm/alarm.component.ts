import { SelectionModel } from '@angular/cdk/collections';
import { formatDate } from '@angular/common';
import { Component, ElementRef, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDateStruct, NgbTimepickerConfig } from '@ng-bootstrap/ng-bootstrap';
import { CheckBoxComponent } from '@syncfusion/ej2-angular-buttons';
import { DropDownTreeComponent } from '@syncfusion/ej2-angular-dropdowns';
import { ScrollbarDirective, UIModalNotificationPage } from 'global';
import { Observable, Subscription } from 'rxjs';
import 'rxjs/add/observable/interval';
import { flatMap } from 'rxjs/operators';
import { MatTablePaginatorComponent } from 'src/app/shared/components/mat-table-paginator/mat-table-paginator.component';
import { globalSharedService } from 'src/app/shared/services/global/globalSharedService';
import { AlarmDataService } from '../../services/alarm-data.service';
// ES6 Modules or TypeScript
import Swal from 'sweetalert2';
/*
export interface AlarmDataModel {
  dateTime: string;
  entityTypeName: string;
  entityName: string;
  typeName: string;
  conditionValue: string;
  dataValue: string;
  eventDataValue: string;
  severityName: string;
  stateName: string;
} */

export class AlarmState {
  id: number;
  name: string;
}

@Component({
  selector: 'app-alarm',
  templateUrl: './alarm.component.html',
  styleUrls: ['./alarm.component.css']
})
export class AlarmComponent implements OnInit, OnDestroy {
  // Importing child component to
  @ViewChild(UIModalNotificationPage) modelNotification;
  @ViewChild('myPaginatorChildComponent') myPaginatorChildComponent: MatTablePaginatorComponent;
  @ViewChild(ScrollbarDirective, { static: false }) directiveRef?: ScrollbarDirective;

  displayedColumns: string[] = ['select', 'entityTypeName', 'entityName', 'typeName', 'conditionValue', 'dateTime', 'dataValue', 'severityName', 'stateName', 'eventDateTime', 'edit'];
  displayTableHeader = [  'Asset', 'Alarm Entity', 'Alarm Type', 'Alarm Condition Value', 'Alarm Time', 'Alarm Value', 'Severity', 'Current State', 'Current State Time'];


  displayedColumns1: string[] = [ 'entityTypeName', 'entityName', 'typeName', 'conditionValue', 'dateTime', 'dataValue', 'severityName', 'stateName', 'eventDateTime', 'edit'];
  // alarmDataForm: FormGroup;
  // assetList: Asset[];
  // displayedColumns: string[] = [];
  public sortDropDown: string = 'Ascending';
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
  acknowledge = false;
  reset = false;
  clear=false;
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
  totalAlarmData = [];
  selectedAlarmStateItems: any[] = [];
  selectedAlarmSeverityItems: any[] = [];
  selectedAssetItems: any[] = [];
  alarmSeveritysForMultiSelect: any[];
  alarmStatesForMultiSelect: any[];
  settings = {};
  assetSettings = {};
  assetsForMultiSelect: any[] = [];
  assetTags: any[] = [];
 // filteredAlarmListWithAlarmState: any[] = [];
  //filteredAlarmListWithAlarmSeverity: any[] = [];
 // filteredAlarmListWithAssetTags: any[] = [];
 // filteredAlarmListWithStartAndEndDates: any[] = [];
  finalListOfFilteredAlarmData: Set<any> = new Set<any>();
  alarmStateIds: any[] = [];
  alarmSeverityIds: any[] = [];
  endDateTime: number;
  startDateTime: number;
  subscribe: Subscription;
  alarmStateMap = new Map<string, number>();
  masterMapOfAlarmData = new Map<number, any>();
  latestAlarmEventTime: any;
  enableViewButton: boolean = false;
  clearTheSearch: boolean = true;
  engUnits: any[] = [];
  timeInterval: any;
  expand: any = false;
  validateEndTime: boolean;
  userType: string;
  checkBoxToolTip: string;
  value: any;
  retainCheckBox : any[] = [];
  @ViewChild(MatSort) set content(content: ElementRef) {
    this.sort = content;
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
  selection = new SelectionModel(true, []);
  // Mat sorting for if use ngIf condition to show table ends here======================
  // treeSettings
  public treeSettings: Object = { autoCheck: true }
  constructor(private formBuilder: FormBuilder, private alarmDataService: AlarmDataService,
    private globalService: globalSharedService, config: NgbTimepickerConfig, private router: Router,
    private route: ActivatedRoute) {
    setInterval(() => { this.currentTime = new Date().getHours() + ':' + new Date().getMinutes() }, 1);
    config.spinners = false;
  }
  ngOnInit() {
    this.getUserType();
    this.dataSource = new MatTableDataSource();
    this.dataSource.filterPredicate = function (data, filter: string): boolean {
      return data.entityTypeName.toLowerCase().includes(filter)
        || data.entityName.toLowerCase().includes(filter)
        || data.typeName.toLowerCase().includes(filter)
        || data.conditionValue.toLowerCase().includes(filter)
        || data.dateTime.toLowerCase().includes(filter)
        || data.dataValue.toLowerCase().includes(filter)
        || data.stateName.toLowerCase().includes(filter)
        || data.severityName.toLowerCase().includes(filter);
    };
    this.loadForm();
    this.getEnggUnits();
    this.getAlarmSeveritys();
    this.getAlarmStates();
    this.getAlarmTypes();
    this.getTableResponse();
    this.getAssetList();
    this.loadDataForTimeInterval();
  }
  getUserType() {
    let isAdmin = sessionStorage.getItem("isAdmin");
    if (isAdmin == 'true') {
      this.userType = 'Admin';
    }
  }
  ngOnDestroy() {
    if (this.subscribe) {
      this.subscribe.unsubscribe();
      this.dataSource.data = [];
      this.totalAlarmData = [];
    }
  }
  loadDataForTimeInterval() {
    let beId = parseInt(sessionStorage.getItem('beId'));
    let userId = parseInt(sessionStorage.getItem('userId'));
    let targetTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    this.alarmDataService.getTimeIntervalsFromFile().toPromise().then(data => {
      this.timeInterval = data.alarmTimeInterval;
      this.subscribe = Observable
        .interval(this.timeInterval)
        .pipe(flatMap(() => this.alarmDataService.getIncrementalAlarmData(beId, targetTimeZone, this.latestAlarmEventTime, userId, this.userType))
        ).subscribe(res => {
          this.dataSource.data.forEach(row => {
            if(this.selection.isSelected(row))
              this.retainCheckBox.push(row);
          })
          if (Array.isArray(res) && res.length != 0) {
            res = res.sort((a, b) => b.eventTime - a.eventTime);
            this.latestAlarmEventTime = res[0].eventTime;
            this.updateTheMasterMap(res);
          }
          this.createDataSourceObject(res);
          for (let i = 0; i < this.retainCheckBox.length; i++) {
            for (let j = 0; j < res.length; j++) {
              if (this.retainCheckBox[i].entityTypeName === (res[j].entityTypeName)) {
                this.selection.select(res[j]);
                break;
              }
            }
          }
          this.retainCheckBox.length = 0;
        })
    })
  }
  updateTheMasterMap(res: any[]) {
    let alarmCount = 0;
    res.forEach(al => {
      this.masterMapOfAlarmData.set(al.id, al)
    })
    res = [];
    Array.from(this.masterMapOfAlarmData.values()).forEach(alarm => {
      if (alarm.stateId !== this.alarmStateMap.get('Cleared') && alarm.stateId !== this.alarmStateMap.get('Disabled')) {
        res.push(alarm);
      }
      if (alarm.stateId == this.alarmStateMap.get('Raised')) {
        alarmCount = alarmCount + 1;
        sessionStorage.setItem("alarmcount", alarmCount.toString());
      }
    })
    res = res.sort((a, b) => b.eventTime - a.eventTime);
    this.totalAlarmData = Array.from(this.masterMapOfAlarmData.values());
    if (res && res.length != 0) {
      if (this.clearTheSearch) {
        this.noRerocrdFound = false;
        // this.dataSource.data = res;
        this.showLoaderImage = false;
      }
    } else {
      this.dataSource.data = []
      this.noRerocrdFound = true;
      this.showLoaderImage = false;
    }
  }
  setAllInfoToAlarm(alarm: any): any {
    let action = [];
    if (this.alarmTypes?.length) {
      for (let type of this.alarmTypes) {
        if (alarm.typeId == type.id) {
          alarm.typeName = type.name
        }
      }
    }
    if (this.alarmSeveritys?.length) {
      for (let severity of this.alarmSeveritys) {
        if (alarm.severityId == severity.id) {
          alarm.severityName = severity.name;
        }
      }
    }
    if (this.alarmStates?.length) {
      for (let state of this.alarmStates) {
        if (alarm.stateId == state.id) {
          alarm.stateName = state.name;
        }
      }
    }
    if (alarm.stateIds?.length) {
      for (let s of alarm.stateIds) {
        for (let state of this.alarmStates) {
          if (s == state.id) {
            let stateObject: AlarmState = new AlarmState();
            stateObject.id = s;
            stateObject.name = state.name;
            action.push(stateObject);
          }
        }
      }
      alarm.alarmStates = action;
    }

    if (this.engUnits?.length) {
      for (let unit of this.engUnits) {
        if (unit.id == alarm.unitId) {
          alarm.conditionValue = alarm.conditionValue + ' ' + unit.name;
          alarm.dataValue = alarm.dataValue + ' ' + unit.name;
        }
      }
    }
    return alarm;
  }
  nodeChecked(event) {
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
    this.patchDates();
    this.futureDateDisabled();
    this.settings = {
      enableSearchFilter: true,
      text: $localize`:@@multiSelectDropdown.select:--Select--`,
      selectAllText: $localize`:@@multiSelectDropdown.selectAll:Select All`,
      unSelectAllText: $localize`:@@multiSelectDropdown.unSelectAll:UnSelect All`,
      classes: "myclass custom-class",
      badgeShowLimit: 0,
    };
  }
  refreshTableListFunction() {
    this.selection.clear();
    this.dataSource.data = [];
    this.getTableResponse();
  }
  onItemSelectAlarmState(item: any) {
    this.selectedAlarmStateItems.push(item);
    this.onClickOfFilterFields();
  }
  OnItemDeSelectAlarmState(item: any) {
    this.selectedAlarmStateItems = this.selectedAlarmStateItems.filter(obj => obj !== item);
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
    this.selectedAlarmSeverityItems = this.selectedAlarmSeverityItems.filter(obj => obj !== item);
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
    let startDate = this.fetchStartDateFromPickerForApiCall();
    let endDate = this.fetchEndDateFromPickerForApiCall();
    let startTime = null;
    let endTime = null;
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
      this.startDateTime = new Date(startDate).getTime();
    } else {
      this.startDateTime = 0;
    }
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
      this.endDateTime = new Date(endDate).getTime();
    } else {
      this.endDateTime = new Date().getTime();
    }
    if (null == startDate && null == endDate) {
      this.startDateTime = 0;
      this.endDateTime = 0;
    }
    this.getAssetTagsAndFilterTheData(this.startDateTime, this.endDateTime);

    this.searchFilterObject = {};
    for (let i = 0; i < this.assetsForMultiSelect.length; i++) {
      for (let object of this.assetsForMultiSelect) {
        if (object.id == this.alarmForm.value.assetIds[i]) {
          this.selectedAssetData += object.name + ', ';
          this.selectedAsset = this.selectedAssetData.slice(0, -2);
        }
      }
    }

    // Format CSV title
    if (this.alarmForm.value.assetIds.length) {
      this.searchFilterObject['Asset'] = this.selectedAsset;
    } else {
      delete this.searchFilterObject['Asset'];
    }

    if (startDate != undefined || startDate != null) {
      this.searchFilterObject['Start Date/Time'] = this.globalService.startDateEndDateTimeSplit(startDate);
    } else {
      delete this.searchFilterObject['Start Date/Time']
    }

    if (endDate != undefined || endDate != null) {
      this.searchFilterObject['End Date/Time'] = this.globalService.startDateEndDateTimeSplit(endDate);
    } else {
      delete this.searchFilterObject['End Date/Time']
    }

    if (this.selectedAlarmSeverityItems.length) {
      this.searchFilterObject['Alarm Severity'] = this.selectedAlarmSeverity.slice(0, -2);
    } else {
      delete this.searchFilterObject['Alarm Severity']
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

  getAssetTagsAndFilterTheData(startDateTime, endDateTime) {
    this.finalListOfFilteredAlarmData.clear();

    let assetIds = [];
    if (null != this.ddTreeObj.value && this.ddTreeObj.value != undefined) {
      this.ddTreeObj.value.forEach(id => {
        assetIds.push(this.parseInt(id))
      })
      if (assetIds.length != 0) {
        this.alarmDataService.getAssetTagsByAssetIds(assetIds).subscribe(data => {
          this.assetTags = data;
          if (null != this.assetTags && this.assetTags.length != 0) {
            this.filterTheDataWithAssetTags(this.assetTags);
            this.filterTheData();
          }
          this.setAllFilters(startDateTime, endDateTime);
        })
      } else {
        this.assetTags = [];
        this.setAllFilters(startDateTime, endDateTime);
      }
    }

  }
  setAllFilters(startDateTime, endDateTime) {
    this.alarmFormData = <any>this.alarmForm.value;
    this.selectedAssetData = '';
    this.selectedAsset = '';
    this.alarmStateIds = [];
    this.alarmSeverityIds = [];
    this.selectedAlarmSeverity = '';

    if (this.selectedAlarmSeverityItems.length) {
      this.selectedAlarmSeverityItems.forEach(e => {
        this.alarmSeverityIds.push(e.id);
        this.selectedAlarmSeverity += e.itemName + ', ';
      })
    }
    this.selectedAlarmState = '';
    if (this.selectedAlarmStateItems.length) {
      this.selectedAlarmStateItems.forEach(e => {
        this.alarmStateIds.push(e.id);
        this.selectedAlarmState += e.itemName + ', ';
      })
    }
    if (null != this.alarmStateIds && this.alarmStateIds.length != 0) {
      this.filterDataWithAlarmState(this.alarmStateIds);
    }

    if (null != this.alarmSeverityIds && this.alarmSeverityIds.length != 0) {
      this.filterDataWithAlarmSeverity(this.alarmSeverityIds);
    }
    if (null != startDateTime && null != endDateTime) {
      this.flterDataWithDates(startDateTime, endDateTime);
    }
    this.filterTheData()
  }
  flterDataWithDates(startDateTime: number, endDateTime: number) {
    if (this.totalAlarmData?.length) {
      this.totalAlarmData.forEach(data => {
        if (data.eventTime >= startDateTime && data.eventTime <= endDateTime) {
          this.finalListOfFilteredAlarmData.add(data);
        }
      })
    }
  }
  filterTheDataWithAssetTags(assetTags: any[]) {
    assetTags.forEach(tag => {
      if (this.totalAlarmData?.length) {
        for (let data of this.totalAlarmData) {
          if (tag.id == data.entityId) {
            this.finalListOfFilteredAlarmData.add(data);
            break;
          }
        }
      }
    })
  }
  filterDataWithAlarmSeverity(alarmSeverityIds: any[]) {
    alarmSeverityIds.forEach(id => {
      if (this.totalAlarmData?.length) {
        for (let data of this.totalAlarmData) {
          if (id == data.severityId) {
            this.finalListOfFilteredAlarmData.add(data);
            break;
          }
        }
      }
    })
  }
  filterDataWithAlarmState(alarmStateIds: any[]) {
    alarmStateIds.forEach(id => {
      if (this.totalAlarmData?.length) {
        for (let data of this.totalAlarmData) {
          if (id == data.stateId) {
            this.finalListOfFilteredAlarmData.add(data);
            break;
          }
        }
      }
    })
  }
  filterTheData() {
    if (this.finalListOfFilteredAlarmData.size != 0) {
      this.noRerocrdFound = false;
      let alarmData = Array.from(this.finalListOfFilteredAlarmData);
      let i = 0;
      for (let data of alarmData) {
        let assetFlag = false, severityFlag = false, stateFlag = false, dateFlag = false
        if (this.assetTags && this.assetTags.length != 0) {
          this.assetTags.forEach(tag => {
            if (tag.id == data.entityId) {
              assetFlag = true;
            }
          })
        } else {
          assetFlag = true;
        }
        if (this.alarmSeverityIds && this.alarmSeverityIds.length != 0) {
          this.alarmSeverityIds.forEach(id => {
            if (id == data.severityId) {
              severityFlag = true;
            }
          })
        } else {
          severityFlag = true;
        }
        if (this.alarmStateIds && this.alarmStateIds.length != 0) {
          this.alarmStateIds.forEach(id => {
            if (id == data.stateId) {
              stateFlag = true;
            }
          })
        } else {
          stateFlag = true;
        }

        if ((null != this.startDateTime && null != this.endDateTime) && (this.startDateTime != 0 || this.endDateTime != 0)) {
          if (data.eventTime >= this.startDateTime && data.eventTime <= this.endDateTime) {
            dateFlag = true
          }
        } else {
          dateFlag = true
        }
        if (dateFlag && stateFlag && severityFlag && assetFlag) {
        } else {
          this.finalListOfFilteredAlarmData.delete(data)
        }
        i++
      }
      let tempArray = Array.from(this.finalListOfFilteredAlarmData);
      alarmData = tempArray.sort((a, b) => b.eventTime - a.eventTime)
      this.showLoaderImage = false;
      if (alarmData.length != 0) {
        this.dataSource.data = alarmData;
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      } else {
        this.dataSource.data = [];
        this.noRerocrdFound = true;
      }
    } else {
      this.dataSource.data = [];
      this.showLoaderImage = false;
      this.noRerocrdFound = true;
    }
  }
  createDataSourceObject(res: any[]): any[] {
    let action = [];
    if (res?.length) {
      res.forEach(alarm => {
        alarm = this.setAllInfoToAlarm(alarm);
        this.masterMapOfAlarmData.set(alarm.id, alarm);
        if (alarm.stateId !== this.alarmStateMap.get('Cleared') && alarm.stateId !== this.alarmStateMap.get('Disabled')) {
          action.push(alarm);
        }
      })
      this.totalAlarmData = res;
      return action;
    }
    this.totalAlarmData = res;
    return action;
  }
  getTableResponse() {
    this.noRerocrdFound = false;
    this.showLoaderImage = true;
    let beId = parseInt(sessionStorage.getItem('beId'));
    let userId = parseInt(sessionStorage.getItem('userId'));
    let targetTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.alarmDataService.getIncrementalAlarmData(beId, targetTimeZone, null, userId, this.userType).subscribe(res => {
      if (null != res && Array.isArray(res) && res.length) {
        res = res.sort((a, b) => b.eventTime - a.eventTime)
        this.latestAlarmEventTime = res[0].eventTime;
        res = this.createDataSourceObject(res);
        if (res && res.length) {
          res = res.sort((a, b) => b.eventTime - a.eventTime)
          this.showLoaderImage = false;
          this.dataSource.data = res;
          this.myPaginator = this.myPaginatorChildComponent.getDatasource();
          this.matTablePaginator(this.myPaginator);
          this.dataSource.paginator = this.myPaginator;
          this.dataSource.sort = this.sort;
        } else {
          this.showLoaderImage = false;
          this.noRerocrdFound = true;
        }
      } else {

        this.showLoaderImage = false;
        this.noRerocrdFound = true;
      }
    });
  }
  getAlarmStates() {
    this.alarmDataService.getAlarmStates().subscribe(res => {
      if (null != res) {
        res = res.sort((a, b) => a.id - b.id);
        res.forEach(state => {
          this.alarmStateMap.set(state.name, state.id)
        })
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
    this.enableViewButton = true;
    let res = [];
    this.getTableResponse()
    // this.updateTheMasterMap(res);
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
    return hours + ':' + minutes;
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
    return hours + ':' + minutes;
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
  validateStartAndEndTime(id: any) {
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
  // filterSearchBox
  filterSearchBox() {
    this.toggleFilterSearch = !this.toggleFilterSearch;
    if (this.toggleFilterSearch) {
      this.filterExpandCollapse = "Click to Hide Filter";
    } else {
      this.filterExpandCollapse = "Click to Show Filter";
    }
  }
  actionChange(element: any) {
    this.alarmEvent = {};
    this.alarmEvent['alarmState'] = element.stateIds[0];
    this.alarmEvent.alarmId = element.id;
    this.alarmEvent.alarmEntityId = element.entityId;
    this.alarmEvent.alarmConfigId = element.configId;
    this.alarmEvent.alarmEventDataValue = element.eventDataValue;
    this.alarmEvent.organizationId = Number(sessionStorage.getItem("beId"));
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
  // Search filter with Table
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
  exportedFileTitleName = "Alarms Report";
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
    title: 'Alarms Report',
    useBom: true,
    noDownload: false,
    headers: this.displayTableHeader
  };
  downloadFile(fileType) {
    this.searchFilterKeysValues = Object.entries(this.searchFilterObject);
    this.searchFieldsContainer = {
      "searchFilterKeysValues": this.searchFilterKeysValues,
      "searchCriteriaText": this.searchCriteriaText
    };
    let tableDataToExport;
    if (this.selection.isEmpty()) {
      tableDataToExport = this.globalService.reCreateNewObject(this.dataSource.data, this.displayedColumns1);
      tableDataToExport = tableDataToExport.map(object => {
        return this.globalService.removeLastIndexAtArray(object);
      });
    } else {
      let mapData;
      tableDataToExport = this.selection.selected.map(object => {
         mapData = {
            entityTypeName: object.entityTypeName,
            entityName:object.entityName,
            typeName:object.typeName,
            conditionValue:object.conditionValue,
            dateTime:object.dateTime,
            dataValue:object.dataValue,
            severityName:object.severityName,
            stateName:object.stateName,
            eventDateTime:object.eventDateTime,
            edit:"-"
          }
        return this.globalService.removeLastIndexAtArray(mapData);
      });
    }
    this.fileName = this.globalService.getExportingFileName("Alarms");
    let exportFile = {
      "fileName": this.fileName,
      "excelWorkSheetName": this.exportedFileTitleName,
      "title": this.exportedFileTitleName,
      "tableHeaderNames": this.xlsxOptions.headers,
      'tableBodyData': tableDataToExport
    };
    this.globalService.downloadFile(fileType, exportFile, this.searchFieldsContainer,
      tableDataToExport, this.fileName, this.csvOptions);
      this.selection.clear();
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
    if (this.directiveRef) {
      this.directiveRef.scrollToTop();
      this.directiveRef.update();
    }
  }
  /*
    Material table paginator code ends here
  */
  // Click to View
  clickToView(alarm) {
    this.router.navigate(['../alarms/view', alarm.id], { relativeTo: this.route });
    this.globalService.setOrganizationDetail("", alarm)
  }
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    if (numSelected === numRows)
      this.checkBoxToolTip = "Deselect All";
    else
      this.checkBoxToolTip = "Select All";
    return numSelected === numRows;
  }
  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.dataSource.data.forEach(row => this.selection.select(row));
  }
  /** The label for the checkbox on the passed row */
  checkboxLabel(row?): string {
    if (!row) {
      let row = `${this.isAllSelected() ? 'select' : 'deselect'} all`;
      return row;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id + 1}`;
  }
   isStateSelected(value) {
    this.value = value;
    if ("Acknowledged" == value) {
       if(this.selection.selected.length <= 0 ){
        this.swalinformation('Please select atleast one Alarm.');
       }
       else
       {this.swalWarning('Raised Alarm(s) state will be changed to Acknowledged. Do you want to proceed?');
      }
    }
    else if ("Reset" == value) {
      if(this.selection.selected.length <= 0 ){
        this.swalinformation('Please select atleast one Alarm.');
       }
       else
       {this.swalWarning('Acknowledged Alarm(s) state will be changed to Reset. Do you want to proceed?');
      }
    }
    else if ("Cleared" == value) {
      if(this.selection.selected.length <= 0 ){
        this.swalinformation('Please select atleast one Alarm.');
       }
       else
       {this.swalWarning('Selected Alarm(s) state will be changed to Cleared. Do you want to proceed?');
      }
    }
  }
  changeAlarmState() {
    let alarms = [];
    let alarmEvent = {};
    this.selection.selected.forEach(element => {
      if ("Acknowledged" == this.value) {
       if (element.stateName == "Raised") {
         alarmEvent = {};
        alarmEvent['alarmState'] = element.stateIds[0];
        alarmEvent['alarmId'] = element.id;
        alarmEvent['alarmEntityId'] = element.entityId;
        alarmEvent['alarmConfigId'] = element.configId;
        alarmEvent['alarmEventDataValue'] = element.eventDataValue;
        alarmEvent['organizationId'] = Number(sessionStorage.getItem("beId"));
        alarmEvent['alarmEventTime'] = new Date().getTime();
        alarmEvent['alarmEventUserId'] = this.parseInt(sessionStorage.getItem('userId'));
        alarms.push(alarmEvent);
      }

    }else if("Reset" == this.value){
      if (element.stateName == "Acknowledged") {
        alarmEvent = {};
       alarmEvent['alarmState'] = element.stateIds[0];
       alarmEvent['alarmId'] = element.id;
       alarmEvent['alarmEntityId'] = element.entityId;
       alarmEvent['alarmConfigId'] = element.configId;
       alarmEvent['alarmEventDataValue'] = element.eventDataValue
       alarmEvent['organizationId'] = Number(sessionStorage.getItem("beId"));
       alarmEvent['alarmEventTime'] = new Date().getTime();
       alarmEvent['alarmEventUserId'] = this.parseInt(sessionStorage.getItem('userId'));
       alarms.push(alarmEvent);
       }
      }
      else if("Cleared" == this.value){
          alarmEvent = {};
         alarmEvent['alarmState'] = 4;
         alarmEvent['alarmId'] = element.id;
         alarmEvent['alarmEntityId'] = element.entityId;
         alarmEvent['alarmConfigId'] = element.configId;
         alarmEvent['alarmEventDataValue'] = element.eventDataValue;
         alarmEvent['organizationId'] = Number(sessionStorage.getItem("beId"));
         alarmEvent['alarmEventTime'] = new Date().getTime();
         alarmEvent['alarmEventUserId'] = this.parseInt(sessionStorage.getItem('userId'));
         alarms.push(alarmEvent);
    }
    });
    if(alarms.length > 0){
      this.alarmDataService.saveAlarmEvents(alarms).subscribe(res => {
        this.modelNotification.alertMessage(res['messageType'], res['message']);
        this.selection.clear();
        if("Cleared" == this.value){
          this.masterMapOfAlarmData.clear();
          this.getTableResponse();
        }
      }, error => {
        this.modelNotification.alertMessage(this.globalService.messageType_Fail, error);
        this.selection.clear();
      })
    }else{
      if("Cleared" == this.value){
        this.swalinformation('No Alarm(s) in Raised / Acknowledged / Reset state to change to Cleared state.');
      }
      else{
      this.swalinformation('No Alarm(s) in Raised / Acknowledged state to change to Acknowledged / Reset.');}
      this.selection.clear();
    }
  }
  // Modal window for Warning info (ex: Cancel/Reset/Tab navigation)
  swalWarning(message) {
    Swal.fire({
      title: 'Warning!',
      text: message,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      showCloseButton: true,
      customClass: {
        confirmButton: 'btn btn-warning',
        container: 'warning_info',
      },
    }).then((result) => {
      if (result.value) {
        this.changeAlarmState()
      }
    })
  }
  swalinformation(message){
    Swal.fire({
      title:'Information',
      text:message,
      icon:'info',
      showCancelButton: false,
      confirmButtonText: 'Ok',

    })
  }
  actionChangeClear(element: any){
    element.stateIds[0]=4;
    this.actionChange(element);
  }
}

@Injectable()
export class NgbDateCustomParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct {
    let result: NgbDateStruct = null;
    if (value) {
      let date = value.split("/");
      result = {
        month: parseInt(date[0], 10),
        day: parseInt(date[1], 10),
        year: parseInt(date[2], 10)
      };
    }
    return result;
  }
  format(date: NgbDateStruct): string {
    let result: string = null;
    if (date) {
      result = date.month + "/" + date.day + "/" + date.year;
    }
    return result;
  }
}

