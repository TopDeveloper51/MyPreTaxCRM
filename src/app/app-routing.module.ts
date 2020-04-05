import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { LayoutAuthenticationComponent } from '@app/layout/layout-authentication/layout-authentication.component';
import { LayoutComponent } from '@app/layout/layout/layout.component';
import { AuthenticationGuard } from '@app/shared/services';
const routes: Routes = [
  {
    path: '',
    //component: LayoutAuthenticationComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@app/authentication/authentication.module').then(
          m => m.AuthenticationModule
        )
      }
    ]
  },
  {
    path: '',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: 'contact',
        loadChildren: () => import('@app/contact/contact.module').then(
          m => m.ContactModule
        )
      }
    ]
  },
  {
    path: 'detail-view',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/ticket-activity/ticket-activity.module').then(
          m => m.TicketActivityModule
        )
      }
    ]
  },
  {
    path: 'customer',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/customer/customer.module').then(
          m => m.CustomerModule
        )
      }
    ]
  },
  {
    path: 'customer-accounting',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/customer-accounting/customer-accounting.module').then(
          m => m.CustomerAccountingModule
        )
      }
    ]
  },
  {
    path: 'ticket-admin',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/ticket-administration/ticket-administration.module').then(
          m => m.TicketAdministrationModule
        )
      }
    ]
  },
  {
    path: 'ticket',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/ticket/ticket.module').then(
          m => m.TicketModule
        )
      }
    ]
  },
  {
    path: 'activity',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/activity/activity.module').then(
          m => m.ActivityModule
        )
      }
    ]
  },
  {
    path: 'reports',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/reports/reports.module').then(
          m => m.ReportsModule
        )
      }
    ]
  },
  {
    path: 'dialer',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/dialer/dialer.module').then(
          m => m.DialerModule
        )
      }
    ]
  },
  {
    path: 'predictiveDialer',
    component: LayoutAuthenticationComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/predictive-dialer/predictive-dialer.module').then(
          m => m.PredictiveDialerModule
        )
      }
    ]
  },
  {
    path: 'training-planning',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/training-planner/training-planner.module').then(
          m => m.TrainingPlannerModule
        )
      }
    ]
  },
  {
    path: 'setting',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/setting/setting.module').then(
          m => m.SettingModule
        )
      }
    ]
  },

  {
    path: 'user',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/user/user.module').then(
          m => m.UserModule
        )
      }
    ]
  },
  {
    path: 'support',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/return-summary/return-summary.module').then(
          m => m.ReturnSummaryModule
        )
      }
    ]
  },
  {
    path: 'assessment',
    component: LayoutComponent,
    canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/assessment/assessment.module').then(
          m => m.AssessmentModule
        )
      }
    ]
  },
  {
    path: 'time-accounting',
    component: LayoutComponent,
    canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/time-accounting/time-accounting.module').then(
          m => m.TimeAccountingModule
        )
      }
    ]
  },
  {
    path: 'reminder',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/reminder/reminder.module').then(
          m => m.ReminderModule
        )
      }
    ]
  },
  {
    path: 'conversion',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/conversion/conversion.module').then(
          m => m.ConversionModule
        )
      }
    ]
  },
  {
    path: 'demo-scheduler',
    component: LayoutComponent,
    // canActivate: [AuthenticationGuard],
    data: { access: { requiredAuthentication: true } },
    children: [
      {
        path: '',
        loadChildren: () => import('@app/demo-scheduler/demo-scheduler.module').then(
          m => m.DemoSchedulerModule
        )
      }
    ]
  },
  
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      useHash: true
    })
  ],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
