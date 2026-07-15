import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { MaintenanceType } from '../../core/models/job.model';
import {
  VehicleCatalogService,
  JobOption,
} from '../../core/ports/vehicle-catalog.port';
import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { AutocompleteComponent } from '../../presentation/shared/components/autocomplete/autocomplete.component';
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
  icon: string;
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
    AutocompleteComponent,
    LucideAngularModule,
  ],
})
export class NewLogPage implements OnInit {
  private router = inject(Router);
  private catalogService = inject(VehicleCatalogService);
  private logService = inject(MaintenanceLogService);

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
  date = 'Date';

  // Mechanic selector state
  previousMechanics: string[] = [];
  selectedMechanic = '';
  showNewMechanicInput = false;
  newMechanicName = '';

  ngOnInit(): void {
    this.loadMechanicNames();
  }

  private loadMechanicNames(): void {
    this.logService.getMechanicNames().subscribe({
      next: (names) => {
        this.previousMechanics = names;
        if (names.length === 0) {
          // No previous mechanics - show new input immediately
          this.showNewMechanicInput = true;
        }
      },
      error: () => {
        this.showNewMechanicInput = true;
      },
    });
  }

  onMechanicChange(value: string): void {
    if (value === '__new__') {
      this.showNewMechanicInput = true;
      this.selectedMechanic = '';
    } else {
      this.showNewMechanicInput = false;
      this.selectedMechanic = value;
    }
  }

  get effectiveMechanicName(): string {
    return this.showNewMechanicInput
      ? this.newMechanicName
      : this.selectedMechanic;
  }

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
      icon: 'droplet',
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

  /** Search function for job autocomplete */
  searchJobs = (query: string): Observable<string[]> => {
    return this.catalogService
      .searchJobs(query)
      .pipe(map((jobs) => jobs.map((j) => j.name)));
  };

  /** Keep track of the last search results with icons */
  private lastJobResults: JobOption[] = [];

  /** Called when a job option is selected from autocomplete */
  onJobSelected(jobIndex: number, selectedName: string): void {
    const match = this.lastJobResults.find((j) => j.name === selectedName);
    if (match) {
      this.jobs[jobIndex].title = match.name;
      this.jobs[jobIndex].icon = match.icon;
    }
  }

  /** Search function that also stores results for icon lookup */
  searchJobsWithCache = (query: string): Observable<string[]> => {
    return this.catalogService.searchJobs(query).pipe(
      map((jobs) => {
        this.lastJobResults = jobs;
        return jobs.map((j) => j.name);
      }),
    );
  };

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
      title: '',
      icon: 'wrench',
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
