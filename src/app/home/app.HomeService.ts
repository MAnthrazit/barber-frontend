import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";;
import { map, Observable, catchError, throwError} from "rxjs";
import { Cut } from "./app.EventInterface";

@Injectable({
  providedIn : 'root'
})

export class HomeService {
  baseUrl : string = '/api';

  constructor(private http: HttpClient){ }

  addRequest(body : any) : Observable<Cut> {
    return this.http.post<Cut>(`${this.baseUrl}/cuts`, body).pipe(
      map((cut : any) => ({
        id: cut.id,
        timestamp_start: new Date(body.timestamp_start),
        timestamp_end: new Date(body.timestamp_end),
        clients: body.clients,
        name: body.name,
        state: 0,
        comment: body.comment
      })),
      catchError(error => {
        console.error(`Add cut failed:`, error);
        return throwError(() => error);
      })
    )
  }

  getAcceptedCuts(date: string) : Observable<Cut[]>{
    return this.http.get<Cut[]>(`${this.baseUrl}/cuts/${date}`).pipe(
      map((cuts : any[]) =>
          cuts.map((cut : any) => ({
            id: cut.id,
            timestamp_start: new Date(cut.timestamp_start),
            timestamp_end: new Date(cut.timestamp_end),
            clients: cut.clients,
            name: cut.name ?? 'Haarschnitt',
            state: cut.state ?? 0,
            comment: cut.comment ?? '',
          }))
      ),
      catchError(error => {
        console.error(`Fetch cuts failed:`, error);
        return throwError(() => error);
      })
    );
  }
}
