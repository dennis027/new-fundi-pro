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
import { Mpesa } from './components/mpesa/mpesa';
import { SearchGigs } from './components/search-gigs/search-gigs';
import { Workhistory } from './components/workhistory/workhistory';
import { ProofOfPayment } from './components/proof-of-payment/proof-of-payment';
import { GigSummary } from './components/gig-summary/gig-summary';
import { CreditScore } from './components/credit-score/credit-score';
import { EmailVerification } from './components/auth/email-verification/email-verification';
import { Dash404 } from './components/dash-404/dash-404';
import { Verification } from './components/verification/verification';
import { Analytics } from './component/analytics/analytics';

export const routes: Routes = [
  {path:'home',component:Home},
  {path:'login',component:Login},
  {path:'register',component:Register},
  {path:'email-verify',component:EmailVerification},
  
  {path:'main-menu',canActivate: [AuthGuard],component:Main, 
    children:[
        {path:'',canActivate: [AuthGuard],component:FundiDash},
        {path:'gigs',canActivate: [AuthGuard],component:AddGig,},
        {path:'profile',canActivate: [AuthGuard],component:Profile,},
        {path:'mpesa',canActivate: [AuthGuard],component:Mpesa},
        {path:'search-gigs',canActivate: [AuthGuard],component:SearchGigs,},
        {path:'work-history',canActivate: [AuthGuard],component:Workhistory,},
        {path:'proof-of-payments',canActivate: [AuthGuard],component:ProofOfPayment},
        {path:'gig-summary',canActivate: [AuthGuard],component:GigSummary,},
        {path:'credit-score',canActivate: [AuthGuard],component:CreditScore,},
        {path:'verification-status',canActivate: [AuthGuard],component:Verification,},
        {path:'analytics',canActivate: [AuthGuard],component:Analytics,},


        { path: '404', component: Dash404 },
        { path: '**', redirectTo: '/404' } 
   ]},


  { path: '404', component: NotFound },
  { path: '**', redirectTo: '/login' } 
  
];
 