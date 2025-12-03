import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { LucideAngularModule } from 'lucide-angular';
import { LucideIconData } from 'lucide-angular/icons/types';

@Component({
  selector: 'auto-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [IonCard, IonCardContent, LucideAngularModule, NgClass],
})
export class CardComponent {
  @Input() title?: string;
  @Input() icon!: LucideIconData;
  @Input() iconColor: 'primary' | 'selected' | 'default' = 'default';
  @Input() selected: boolean = false;
}
