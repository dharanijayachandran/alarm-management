import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-export-files-to',
  templateUrl: './export-files-to.component.html',
  styleUrls: ['./export-files-to.component.css']
})
export class ExportFilesToComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  @Output() exportedTo = new EventEmitter();
  // Export file to
  downloadFile(exportedTo) {
    this.exportedTo.emit(exportedTo);
  }

}
