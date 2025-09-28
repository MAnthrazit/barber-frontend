import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";;
import { map, Observable } from "rxjs";
import { Cut } from "./app.EventInterface";

@Injectable({
  providedIn : 'root'
})

export class HomeService {
  baseUrl : string = '/api';

  constructor(private http: HttpClient){ }

  addRequest(body : any) : Observable<Cut> {
    return this.http.post<any>(`${this.baseUrl}/cuts`, body);
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
      )
    );
  }
}
