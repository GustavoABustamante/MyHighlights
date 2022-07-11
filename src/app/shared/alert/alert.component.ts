import { Component, OnInit, Input } from '@angular/core';
import { InputComponent } from '../input/input.component';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.css']
})
export class AlertComponent implements OnInit {
@Input() color = "neutral"
@Input() loading = false

get bgColor() {
  return `bg-${this.color}-800`
}

  constructor() { }

  ngOnInit(): void {
  }
}
