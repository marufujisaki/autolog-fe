import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonButton } from '@ionic/angular/standalone';
import { LucideAngularModule } from 'lucide-angular';
import { LucideIconData } from 'lucide-angular/icons/types';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'auto-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, LucideAngularModule, RouterModule],
})
export class ButtonComponent {
  @Input() variant: 'primary' | 'secondary' = 'primary';
  @Input() icon?: LucideIconData;
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled = false;
  @Input() routerLink?: any;
  @Input() routerDirection?: 'forward' | 'back' | 'root';
}
