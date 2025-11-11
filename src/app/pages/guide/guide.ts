import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';


@Component({
  selector: 'app-guide',
  imports: [],
  templateUrl: './guide.html',
  styleUrl: './guide.css',
})
export class Guide {
  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }
  
}