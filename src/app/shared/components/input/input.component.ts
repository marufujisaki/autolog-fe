import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'auto-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class InputComponent {
  @Input() type: 'text' | 'email' | 'password' | 'date' = 'text';
  @Input() placeholder: string = '';
  @Input() value: string = '';
  @Input() autocomplete: string = 'off';
  @Input() label: string = '';
  @Output() valueChange = new EventEmitter<string>();
}
