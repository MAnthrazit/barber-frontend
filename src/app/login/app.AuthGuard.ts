import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router
} from '@angular/router';
import { AuthService } from './app.AuthService';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
