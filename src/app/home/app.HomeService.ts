import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";;
import { Observable } from "rxjs";
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

  getCutsRequest(date: string) : Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/cuts/${date}`);
  }


  getCuts() : Observable<any[]>{
    return this.http.get<any[]>(`${this.baseUrl}/cuts`);
  }
}
