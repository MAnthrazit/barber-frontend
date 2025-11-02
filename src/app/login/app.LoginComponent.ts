import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "./app.AuthService";
import { Router } from "@angular/router";

@Component({
  selector: 'app-login-component',
  styleUrls: ['app.LoginComponent.css', '../home/app.InfoWrapper.css'],
  templateUrl: 'app.LoginComponent.html',
  imports: [FormsModule]
})

export class LoginComponent{
  username : string = '';
  password: string = '';

  constructor(private auth: AuthService, private router: Router){}

  login(event : Event): void {
    event.preventDefault();
    this.auth.login(this.username, this.password).subscribe({
      next: (res) => {
        this.auth.saveToken(res.token);
        this.auth.isLoginSubject.next(true);
        this.router.navigate(['dashboard']);
      },
      error: (error: any) => {
        console.error(error.message);
      }
    });
  }

  logout(event : Event): void {
    event.preventDefault();
    this.auth.logout();
  }
}


