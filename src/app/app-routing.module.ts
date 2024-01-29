import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AlarmViewComponent } from './alarm/pages/alarm-view/alarm-view.component';
import { AlarmComponent } from './alarm/pages/alarm/alarm.component';
import { EventsComponent } from './alarm/pages/events/events/events.component';


const routes: Routes = [
  {
    path: 'alarms',
    children: [
      {
        path: '',
        component: AlarmComponent,
        pathMatch: 'full'
      },
      {
        path: 'view/:id',
        component: AlarmViewComponent
      },
    ]
  }, {
    path: 'events',
    children: [
      {
        path: '',
        component: EventsComponent,
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    { provide: APP_BASE_HREF, useValue: '/alarm' },
  ],
})
export class AppRoutingModule { }
export const alarmDeclaration = [
  EventsComponent,
  AlarmComponent,
  AlarmViewComponent
]