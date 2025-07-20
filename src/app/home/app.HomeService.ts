import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";;
import { Observable } from "rxjs";
import { Cut } from "./app.EventInterface";

@Injectable({
  providedIn : 'root'
})

export class HomeService {
  baseUrl : string = '';

  constructor(private http: HttpClient){ }

  addRequest(form: FormData) : Observable<Cut> {
    return this.http.post<any>(`${this.baseUrl}/api/cuts`, form);
  }

  getRequest() : Observable<Cut[]>{
    return this.http.get<Cut[]>(`${this.baseUrl}/api/cuts`);
  }
}
