import { Routes } from '@angular/router';
import { HomeComponent } from './home/app.HomeComponent';
import { LoginComponent } from './login/app.LoginComponent';
import { DashboardComponent } from './dashboard/app.DashboardComponent';


export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'dashboard', component: DashboardComponent}
];
