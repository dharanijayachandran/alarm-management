import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'alarm-management-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
  title = 'alarm-management';
  topMenu: any;
  sidebarMenuFlag: any;
  sideMenuBarStatus: boolean;
  constructor(){
  //reading topMenu and sidebar menu flags from session storage
  this.topMenu = JSON.parse(sessionStorage.getItem("topMenu"));
  this.sidebarMenuFlag = JSON.parse(sessionStorage.getItem("sidebarMenu"));
  //if no theme selected,means theme don;t have any preference for menu,we are making side bar as true here.
  if (this.sidebarMenuFlag == undefined && this.topMenu == undefined) {
    this.sidebarMenuFlag = true;
  }
  }  
  ngOnInit(): void {
    const value = sessionStorage.getItem('sideMenuBarStatus');
    if (value === 'closed') {
      this.sideMenuBarStatus = true;
    }
    else if (value === 'open') {
      this.sideMenuBarStatus = false;
    }
  }
}
