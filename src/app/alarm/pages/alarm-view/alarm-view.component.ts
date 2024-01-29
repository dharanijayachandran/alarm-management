import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { globalSharedService } from 'src/app/shared/services/global/globalSharedService';
import { AlarmDataService } from '../../services/alarm-data.service';

@Component({
  selector: 'alarm-management-alarm-view',
  templateUrl: './alarm-view.component.html',
  styleUrls: ['./alarm-view.component.css']
})
export class AlarmViewComponent implements OnInit {
  alarm: any;
  alarmEvents: any[];

  constructor(private globalService: globalSharedService, private router: Router, private route: ActivatedRoute, private alarmDataService: AlarmDataService) { }

  ngOnInit(): void {
    this.alarm = this.globalService.listOfRow;
    if (this.alarm) {
      this.getAlarmEventsByAlarmId(this.alarm.id);
    }

  }

  backButton() {
    this.router.navigate(['../../'], { relativeTo: this.route });
  }

  getAlarmEventsByAlarmId(alarmId: number) {
    let organizationId = sessionStorage.getItem("beId");
    this.alarmDataService.getAlarmEventsByAlarmId(alarmId, organizationId).subscribe(res => {
      this.alarmEvents = res;
    },
      error => {
      })
  }
}
