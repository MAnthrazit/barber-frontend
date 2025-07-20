import { Routes } from '@angular/router';
import { HomeComponent } from './home/app.HomeComponent';
import { LoginComponent } from './login/app.LoginComponent';


export const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent}
];
