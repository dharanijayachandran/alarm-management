import { Injectable } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { TimeZone } from '../../model/timeZone';


const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};
@Injectable({
  providedIn: 'root'
})
export class TimezoneService {

  apiurl=environment.baseUrl_MasterDataManagement;

  constructor(private http: HttpClient) {}
  
  getTimeZoneList(): Observable<TimeZone[]> {
    return this.http.get<TimeZone[]>(this.apiurl+'timezone');
  }
}
