import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { NotFound } from './components/not-found/not-found';
import { FundiDash } from './components/fundi-dash/fundi-dash';
import { Login } from './components/auth/login/login';
import { Register } from './components/auth/register/register';
import { AuthGuard } from './guards/auth-guard';
import { Main } from './components/main/main';
import { AddGig } from './components/add-gig/add-gig';
import { Profile } from './components/profile/profile';

export const routes: Routes = [
  {path:'home',component:Home},
  {path:'login',component:Login},
  {path:'register',component:Register},
  
  {path:'main-menu',canActivate: [AuthGuard],component:Main, 
    children:[
        {path:'',canActivate: [AuthGuard],component:FundiDash},
        {path:'gigs',canActivate: [AuthGuard],component:AddGig,},
        {path:'profile',canActivate: [AuthGuard],component:Profile,},
   ]},


  { path: '404', component: NotFound },
  { path: '**', redirectTo: '/404' } 
  
];
