import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, map, Observable, throwError} from "rxjs";
import { Holiday } from "../holiday/app.HolidayInterface";

@Injectable({
  providedIn: 'root'
})

export class  HolidayService{
  baseUrl : string = '/api';

  constructor(private http: HttpClient){}

  addHoliday(data: any): Observable<Holiday>{
    return this.http.post<Holiday>(`${this.baseUrl}/holidays`, data).pipe(
      map((holiday : any) => ({
        id: holiday.id,
        timestamp_start: new Date(data.timestamp_start!),
        timestamp_end: new Date(data.timestamp_end!)
      })),
      catchError((error : any ) => {
        console.error('Add holiday failed:', error);
        return throwError(() => error);
      })
  );
}


  getHolidays(): Observable<Holiday[]>{
    return this.http.get<Holiday[]>(`${this.baseUrl}/holidays`).pipe(
      map((holidays : any[]) =>
        holidays.map((holiday : any) => ({
          id: holiday.id,
          timestamp_start: new Date (holiday.timestamp_start),
          timestamp_end: new Date (holiday.timestamp_end),
        }))
      ),
      catchError(error => {
        console.error('Fetch holidays failed:', error);
        return throwError(() => error);
      })
    );
  }

  deleteHoliday(id : number): Observable<any>{
    return this.http.delete<any>(`${this.baseUrl}/holidays/${id}`).pipe(
      catchError(error => {
        console.error(`Delete holiday ${id} failed:`, error);
        return throwError(() => error);
      })
    );
  }
}
