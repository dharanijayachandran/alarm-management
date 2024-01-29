import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { globalSharedService } from '../../services/global/globalSharedService';

@Component({
  selector: 'app-mat-table-paginator',
  templateUrl: './mat-table-paginator.component.html',
  styleUrls: ['./mat-table-paginator.component.css']
})
export class MatTablePaginatorComponent implements OnInit {

  pageSize: number;
  pageSizeOptions: number[] = [100, 500, 1000, 5000];
  pageEvent: PageEvent;
  minimumPageSize:number = this.pageSizeOptions[0];


  /* 
    Decorators
  */
  @Input() dataSource;
  @ViewChild('myPaginator') myPaginator;
  @Output() paginator = new EventEmitter<any>();
  @Output() scrollBarDirective = new EventEmitter<any>();

  constructor(private globalService: globalSharedService) { }

  ngOnInit(): void {
  }

  /* 
    paginator - Emit the value like pageIndex, pageSize, length
    scrollBarDirective - Emit when change the pageIndex, pageSize, length view should be top of the page 
  */
  paginatorEvent(event: PageEvent) {
    this.paginator.emit(event);
    this.scrollBarDirective.emit();
  }

  /* 
    Emit the Paginator events from Child component
  */
  getDatasource() {
    return this.myPaginator;
  }


  // On change screen table page size change starts here ====================

  // (window:resize)="onResize($event)"
  /* onResize(event) {
    if(event.target.innerWidth > 768 && event.target.innerWidth < 992){
      // For Laptop/Ipad
      this.pageSize = 10;
    }else if(event.target.innerWidth > 1400 ){
      // For Big screen
      this.pageSize = 20;
    }
  } */
  // On change screen table page size change ends here ====================

}
