import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl + 'api/';

  constructor(private http: HttpClient) {}

  getUserDetails(): Observable<any> {
    return this.http.get<any>(
      this.apiUrl + 'user/'
    );
  }

  updateUserDetails(payload: any): Observable<any> {
    return this.http.put<any>(
      this.apiUrl + 'profile/',
      payload
    );
  }

  fundiStats(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/dashboard/stats/'); 
  }

  userRecentWorks(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/dashboard/recent-work/'); 
  }

  dashCalendarData(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/dashboard/calendar/'); 
  }

  creditHistory(): Observable<any> { 
    return this.http.get<any>(this.apiUrl + 'fundi/dashboard/credit-history/'); 
  }

  allGigView(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/dashboard/all-gigs/'); 
  }
  getAllOrgs(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/dashboard/organizations/'); 
  }

}                   