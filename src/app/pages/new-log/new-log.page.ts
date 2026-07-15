import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaintenanceType } from '../../core/models/job.model';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import {
  LucideAngularModule,
  ChevronLeftIcon,
  ChevronDownIcon,
  PlusIcon,
  PencilIcon,
  Trash2Icon,
  DropletIcon,
  TagsIcon,
  CirclePlusIcon,
  UserRoundIcon,
  CalendarIcon,
} from 'lucide-angular';

interface JobItem {
  name: string;
  qty: number;
  unitCost: number;
  subtotal: number;
}

interface JobEntry {
  id: number;
  title: string;
  types: MaintenanceType[];
  description: string;
  items: JobItem[];
  serviceCost: number;
  serviceQty: number;
}

/**
 * NewLogPage — Create maintenance log (Figma: "New Log" and "New Log - Item" frames).
 * Shows vehicle selector, odometer, mechanic/date info, editable jobs,
 * and an "Add Item" bottom-sheet popup.
 */
@Component({
  selector: 'app-new-log',
  templateUrl: './new-log.page.html',
  styleUrls: ['./new-log.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    InputComponent,
    LucideAngularModule,
  ],
})
export class NewLogPage {
  private router = inject(Router);

  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronDownIcon = ChevronDownIcon;
  readonly PlusIcon = PlusIcon;
  readonly PencilIcon = PencilIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly DropletIcon = DropletIcon;
  readonly TagsIcon = TagsIcon;
  readonly CirclePlusIcon = CirclePlusIcon;
  readonly UserRoundIcon = UserRoundIcon;
  readonly CalendarIcon = CalendarIcon;

  selectedVehicle = 'Chevrolet Aveo AA453YR';
  odometer = '305.555 km';
  mechanic = 'Mechanic';
  date = 'Date';

  // Add Item popup state
  showAddItemPopup = false;
  activeJobIndex = 0;
  newItemDescription = '';
  newItemQuantity = '';
  newItemUnitCost = '';

  jobs: JobEntry[] = [
    {
      id: 1,
      title: 'Oil Change',
      types: [MaintenanceType.CONSUMABLE, MaintenanceType.SERVICE],
      description: 'Lorem',
      items: [
        { name: 'Oil Filter', qty: 1, unitCost: 40, subtotal: 40 },
        { name: 'New Oil', qty: 6, unitCost: 8, subtotal: 48 },
      ],
      serviceCost: 30,
      serviceQty: 0,
    },
  ];

  getTypeClass(type: MaintenanceType): string {
    return `label-${type.toLowerCase()}`;
  }

  getTypeLabel(type: MaintenanceType): string {
    return type.charAt(0) + type.slice(1).toLowerCase();
  }

  getJobTotal(job: JobEntry): number {
    return job.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  addJob(): void {
    const newId = this.jobs.length + 1;
    this.jobs.push({
      id: newId,
      title: `Job ${newId}`,
      types: [],
      description: '',
      items: [],
      serviceCost: 0,
      serviceQty: 0,
    });
  }

  deleteJob(index: number): void {
    this.jobs.splice(index, 1);
  }

  // --- Add Item Popup ---

  openAddItemPopup(jobIndex: number): void {
    this.activeJobIndex = jobIndex;
    this.newItemDescription = '';
    this.newItemQuantity = '';
    this.newItemUnitCost = '';
    this.showAddItemPopup = true;
  }

  closeAddItemPopup(): void {
    this.showAddItemPopup = false;
  }

  confirmAddItem(): void {
    const qty = parseInt(this.newItemQuantity, 10) || 0;
    const unitCost = parseFloat(this.newItemUnitCost) || 0;

    if (this.newItemDescription.trim() && qty > 0) {
      this.jobs[this.activeJobIndex].items.push({
        name: this.newItemDescription.trim(),
        qty,
        unitCost,
        subtotal: qty * unitCost,
      });
    }

    this.closeAddItemPopup();
  }

  saveLog(): void {
    void this.router.navigate(['/tabs/vehicles']);
  }

  goBack(): void {
    void this.router.navigate(['/tabs/vehicles']);
  }
}
