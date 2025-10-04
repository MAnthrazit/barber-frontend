import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError } from "rxjs";
import { Cut } from "../home/app.EventInterface";

@Injectable({
  providedIn: 'root'
})

export class  DashboardService{
  baseUrl : string = '/api';

  constructor(private http: HttpClient){}

  rejectRequest(id: number): Observable<any>{
    return this.http.delete<any>(`${this.baseUrl}/cuts/reject/${id}`).pipe(
      catchError((error : any ) => {
        console.error('Reject request failed:', error);
        return throwError(() => error);
      })
    );
  }

  acceptRequest(id: number): Observable<Cut>{
    return this.http.post<Cut>(`${this.baseUrl}/cuts/accept/${id}`, {}).pipe(
      map((event : any) => ({
            id: event.id,
            timestamp_start: new Date(event.timestamp_start),
            timestamp_end: new Date(event.timestamp_end),
            clients: event.clients,
            name: event.name,
            state: event.state,
            comment: event.comment,
      })),
      catchError((error : any ) => {
        console.error('Accept request failed:', error);
        return throwError(() => error);
      })
    );
  }

  getCuts() : Observable<Cut[]>{
    return this.http.get<Cut[]>(`${this.baseUrl}/cuts`).pipe(
      map((cuts : any) =>
          cuts.map((cut : any) => ({
            id: cut.id,
            timestamp_start: new Date(cut.timestamp_start),
            timestamp_end: new Date(cut.timestamp_end),
            clients: cut.clients,
            name: cut.name,
            state: cut.state,
            comment: cut.comment,
          }))
      ),
      catchError((error : any ) => {
        console.error('Fetch cuts failed:', error);
        return throwError(() => error);
      })
    );
  }
}
