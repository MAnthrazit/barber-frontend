import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../login/app.AuthService';

@Component({
  selector: 'app-navbar-component',
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './app.NavbarComponent.html',
  styleUrl: './app.NavbarComponent.css'
})
export class NavbarComponent implements OnInit{

  isLoggedIn : boolean = false;

  ngOnInit(): void {
    this.auth.isAuthenticated().subscribe((isAuth : boolean) => {
      this.auth.isLoginSubject.next(isAuth);
    });
  }

  constructor(public auth : AuthService, private router : Router){}

  logout(event: Event): void{
    event.preventDefault()
    this.auth.logout();
    this.router.navigate(['/'])
  }
}
