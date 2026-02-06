import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  
   private apiUrl = environment.apiUrl + 'api/';

  constructor(private http: HttpClient) {}

  workTrends(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/work-trends/'); 
  }

  orgPerformance(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/organization-performance/'); 
  }

  jobTypes(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/job-types/'); 
  }

  creditScore(): Observable<any> { 
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/credit-score/'); 
  }

  earnings(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/earnings/'); 
  }
  location(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/location/'); 
  }

  verification(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/verification/'); 
  }

  workerConsistency(id:any): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/work-consistency/'); 
  }

  comparativeE(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/comparative/'); 
  }
  summary(): Observable<any> {
    return this.http.get<any>(this.apiUrl + 'fundi/analytics/summary/'); 
  }

}
