import { Routes } from '@angular/router';
import { HomeComponent } from './home/app.HomeComponent';
import { LoginComponent } from './login/app.LoginComponent';
import { DashboardComponent } from './dashboard/app.DashboardComponent';
import { AuthGuard } from './login/app.AuthGuard';
import { LoginGuard } from './login/app.LoginGuard';


export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]}
];
