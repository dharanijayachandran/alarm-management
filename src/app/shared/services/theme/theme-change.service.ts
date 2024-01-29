import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeChangeService {

  constructor(private http: HttpClient) { }

  getThemeNames(): Observable<[]> {
    return this.http.get<any>('assets/json/themeNames.json');
  }
}
