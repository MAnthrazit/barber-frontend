import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Cut } from "../home/app.EventInterface";
@Injectable({
  providedIn: 'root'
})

export class  DashboardService{
  baseUrl : string = '';

  constructor(private http: HttpClient){}

  rejectRequest(id: number): Observable<any>{
    return this.http.delete<any>(`${this.baseUrl}/api/cuts/reject/` + id);
  }

  acceptRequest(id: number): Observable<Cut>{
    return this.http.delete<Cut>(`${this.baseUrl}/api/cuts/accept/` + id);
  }

  insertHoliday(dates : Date[]): Observable<Date[]>{
    return this.http.post<Date[]>(`${this.baseUrl}/api/holidays/insert`, dates);
  }

  deleteHoliday(dates : Date[]): Observable<Date[]>{
    return this.http.post<Date[]>(`${this.baseUrl}/api/holidays/delete`, dates);
  }

}
