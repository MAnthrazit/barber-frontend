import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';
import { AuthService } from './app.AuthService';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoginGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    return this.auth.isLoginSubject.asObservable().pipe(
      map((isLoggedIn : boolean) => {
        if (isLoggedIn) {
          this.router.navigate(['/dashboard']);
          return true;
        } else {
          return false;
        }
      })
    );
  }
}
