import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlarmDataService {


  apiurl = environment.baseUrl_AssetManagement;
  alarmApiUrl = environment.baseUrl_AlarmManagement;
  masterApiurl = environment.baseUrl_MasterDataManagement;
  constructor(private http: HttpClient) {
  }

  getAssetList(organizationId: number): Observable<any[]> {
    let userId = sessionStorage.getItem("userId");
    let userType;
    if (sessionStorage.getItem("isAdmin") == "true") {
      userType = "Admin";
    }
    else {
      userType = "";
    }
    return this.http.get<any[]>(this.alarmApiUrl + 'organizations/' + organizationId + "/assets?user-id=" + userId + "&user-type=" + userType);
    // let userId = sessionStorage.getItem("userId");
    // return this.http.get<any[]>(this.apiurl + 'assetsByOrganiztionId/' + organizationId + "?user-id=" + userId);
  }
  /* getAlarmTypesForDiscrete() {
    return this.http.get<any[]>(this.alarmApiUrl + 'discreteAlarmTypes')
  } */

  getAlarmStates() {
    return this.http.get<any[]>(this.alarmApiUrl + 'alarmStates')
  }

  getAlarmSeveritys() {
    return this.http.get<any[]>(this.alarmApiUrl + 'alarm-severitys')
  }

  getAlarmTypes() {
    return this.http.get<any[]>(this.masterApiurl + 'alarm-types')
  }

  getAlarmDataByBusinessEntityId(beId: number, zoneId: string) {
    return this.http.get<any[]>(this.alarmApiUrl + 'organization/' + beId + '/alarms?targetTimeZone=' + zoneId)
  }

  getAlarmDataByBeIdTimeZoneAndSearchFeilds(beId: number, zoneId: string, alarmStartDate: number, alarmEndDate: number, assetId: string, alarmSeverity: string, alarmState: string, userId: number) {
    let userType;
    if (sessionStorage.getItem("isAdmin") == "true") {
      userType = "Admin";
    }
    else {
      userType = "";
    }
    let url = 'organizations/' + beId + '/events-filter?target-time-zone=' + zoneId + '&user-id=' + userId + '&user-type=' + userType;
    if (null != alarmStartDate) {
      url = url + "&start-date=" + alarmStartDate;
    } else {
      url = url + "&start-date=";
    }
    if (null != alarmEndDate) {
      url = url + "&end-date=" + alarmEndDate;
    } else {
      url = url + "&end-date==";
    }
    if (null != assetId) {
      url = url + "&asset-ids=" + assetId;
    } else {
      url = url + "&asset-ids=";
    } 
    if (null != alarmSeverity) {
      url = url + "&severity-ids=" + alarmSeverity;
    } else {
      url = url + "&severity-ids=";
    }
    if (null != alarmState) {
      url = url + "&state-ids=" + alarmState;
    } else {
      url = url + "&state-ids=";
    }
    return this.http.get<any[]>(this.alarmApiUrl + url)
  }

  saveAlarmEvent(alarmEvent: any) {
    return this.http.post<any>(this.alarmApiUrl + 'alarm-event', alarmEvent);
  }

  getAssetTagsByAssetIds(assetIds) {
    return this.http.get<any[]>(this.apiurl + 'assetTags/' + assetIds);
  }

  getIncrementalAlarmData(beId: number, targetTimeZone: string, latestTime: number, userId: number, userType: string) {
    let url = 'organizations/' + beId + '/alarms?target-time-zone=' + targetTimeZone + '&user-id=' + userId + '&user-type=' + userType
    if (null != latestTime) {
      url = url + "&latest-time=" + latestTime;
    } else {
      url = url + "&latest-time=";
    }
    return this.http.get<any[]>(this.alarmApiUrl + url)
  }


  getEnggUnits(): Observable<any[]> {
    return this.http.get<any[]>(environment.baseUrl_gatewayManagement + 'getEnggUnits');
  }

  getTimeIntervalsFromFile(): Observable<any> {
    return this.http.get<any>('/assets/json/timeInterval.json');
  }

  getAlarmCount(beId: number, zoneId: string, latestTime: number, userId: number) {
    let url = 'organization/' + beId + '/alarm-count?targetTimeZone=' + zoneId + '&user-id=' + userId
    if (null != latestTime) {
      url = url + "&latestTime=" + latestTime;
    } else {
      url = url + "&latestTime=";
    }
    return this.http.get<any>(this.alarmApiUrl + url)
  }
  getEventsByOrganizationId(beId: number, targetTimeZone: string, alarmStartDate: number, alarmEndDate: number, userType: string, userId: number) {
    let url = 'organizations/' + beId + '/events?target-time-zone=' + targetTimeZone + '&start-date=' + alarmStartDate + '&end-date=' + alarmEndDate + '&user-id=' + userId + '&user-type=' + userType
    return this.http.get<any[]>(this.alarmApiUrl + url)
  }

  getAlarmEventsByAlarmId(alarmId: number, organizationId: string) {
    let targetTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    let url = 'organizations/' + organizationId + '/events/' + alarmId + '?target-time-zone=' + targetTimeZone
    return this.http.get<any[]>(this.alarmApiUrl + url)
  }

  saveAlarmEvents(alarmEvents: any) {
    return this.http.post<any>(this.alarmApiUrl + 'alarm-events', alarmEvents);
  }
}
