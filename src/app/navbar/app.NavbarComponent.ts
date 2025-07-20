import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../login/app.AuthService';

@Component({
  selector: 'app-navbar-component',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.NavbarComponent.html',
  styleUrl: './app.NavbarComponent.css'
})
export class NavbarComponent {

  constructor(private auth : AuthService){}

  logout(event: Event): void{
    event.preventDefault();
    this.auth.logout();
  }

  isLoggedIn(): boolean {
    return this.auth.isAuthenticated();
  }

}
