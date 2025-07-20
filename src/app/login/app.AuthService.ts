import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";;
import { Observable } from "rxjs";

@Injectable({
  providedIn : 'root'
})

export class AuthService {
  baseUrl : string = '';
  tokenKey : string = 'jwt'

  constructor(private http: HttpClient){ }

  login(username: string, password: string) : Observable<{token: string}> {
    return this.http.post<{token: string}>(`${this.baseUrl}/api/login`, {username, password});
  }

  logout() : void {
    localStorage.removeItem(this.tokenKey);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

   isAuthenticated(): boolean {
    return !!this.getToken();
  }

}

