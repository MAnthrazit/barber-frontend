import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";;
import { BehaviorSubject, catchError, map, Observable, of } from "rxjs";

@Injectable({
  providedIn : 'root'
})

export class AuthService {
  baseUrl : string = 'http://localhost:9000';
  isLoginSubject = new BehaviorSubject<boolean>(false);
  tokenKey : string = 'jwt'

  constructor(private http: HttpClient){ }

  login(username: string, password: string) : Observable<{token: string}> {
    return this.http.post<{token: string}>(`${this.baseUrl}/api/login`, {username, password});
  }

  logout() : void {
    localStorage.removeItem(this.tokenKey);
    this.isLoginSubject.next(false);
  }

  saveToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/api/auth-check`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }
}

