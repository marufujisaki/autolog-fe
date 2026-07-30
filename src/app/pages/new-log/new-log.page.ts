import {
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { IonModal, IonDatetime } from '@ionic/angular/standalone';
import { TranslatePipe } from '@ngx-translate/core';
import { MaintenanceType } from '../../core/models/job.model';
import {
  VehicleCatalogService,
  JobOption,
} from '../../core/ports/vehicle-catalog.port';
import { MaintenanceLogService } from '../../core/ports/maintenance-log.port';
import { VehicleService } from '../../core/ports/vehicle.port';
import { Vehicle } from '../../core/models/vehicle.model';
import { CreateLogData } from '../../core/models/maintenance-log.model';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { AutocompleteComponent } from '../../presentation/shared/components/autocomplete/autocomplete.component';
import {
  SelectComponent,
  SelectOption,
} from '../../presentation/shared/components/select/select.component';
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
  WrenchIcon,
  WindIcon,
  SnowflakeIcon,
  FanIcon,
  Disc3Icon,
  GaugeIcon,
  RefreshCwIcon,
  ClipboardCheckIcon,
  LucideIconData,
} from 'lucide-angular';

interface JobItem {
  name: string;
  qty: number;
  unitCost: number;
  subtotal: number;
}

interface JobEntry {
  id: number;
  isPersisted: boolean;
  title: string;
  icon: string;
  types: MaintenanceType[];
  description: string;
  items: JobItem[];
  serviceCost: number;
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
    SelectComponent,
    LucideAngularModule,
    IonModal,
    IonDatetime,
    TranslatePipe,
  ],
})
export class NewLogPage implements OnInit {
  private router = inject(Router);
  private catalogService = inject(VehicleCatalogService);
  private logService = inject(MaintenanceLogService);
  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);

  @ViewChildren('jobCard', { read: ElementRef })
  private jobCards!: QueryList<ElementRef<HTMLElement>>;

  editLogId = '';
  isEditMode = false;
  isLoadingLog = false;
  saveErrorKey = '';

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

  // Icon map for job types
  private readonly iconMap: Record<string, LucideIconData> = {
    droplet: DropletIcon,
    wrench: WrenchIcon,
    wind: WindIcon,
    snowflake: SnowflakeIcon,
    fan: FanIcon,
    'disc-3': Disc3Icon,
    gauge: GaugeIcon,
    'refresh-cw': RefreshCwIcon,
    'clipboard-check': ClipboardCheckIcon,
  };

  // Tag dropdown state
  tagDropdownJobIndex: number | null = null;
  readonly availableTypes: MaintenanceType[] = [
    MaintenanceType.REPLACEMENT,
    MaintenanceType.SERVICE,
    MaintenanceType.REPAIR,
    MaintenanceType.CONSUMABLE,
    MaintenanceType.INSPECTION,
  ];

  // Vehicle selection
  vehicles: Vehicle[] = [];
  vehicleOptions: SelectOption[] = [];
  selectedVehicleId = '';
  odometerValue: number | null = null;
  currentVehicleMileage = 0;
  selectedDate = '';
  showDatePicker = false;
  todayISO = new Date().toISOString();

  // Mechanic selector state
  previousMechanics: string[] = [];
  selectedMechanic = '';
  showNewMechanicInput = false;
  newMechanicName = '';
  mechanicDropdownOpen = false;

  ngOnInit(): void {
    this.editLogId = this.route.snapshot.paramMap.get('logId') || '';
    this.isEditMode = Boolean(this.editLogId);
    this.selectedVehicleId =
      this.route.snapshot.paramMap.get('vehicleId') || '';

    this.loadVehicles();
    this.loadMechanicNames();
    if (this.isEditMode) {
      this.loadLogForEdit();
    }
  }

  private loadVehicles(): void {
    this.vehicleService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles = vehicles;
        this.vehicleOptions = vehicles.map((v) => ({
          value: v.id,
          label: `${v.brand} ${v.model} ${v.licensePlate || ''}`.trim(),
        }));
        if (vehicles.length > 0 && !this.selectedVehicleId) {
          this.selectedVehicleId = vehicles[0].id;
          this.updateCurrentMileage();
        } else if (this.selectedVehicleId) {
          this.updateCurrentMileage();
        }
      },
    });
  }

  private loadLogForEdit(): void {
    if (!this.editLogId) return;

    this.isLoadingLog = true;
    this.logService.getLog(this.editLogId).subscribe({
      next: (log) => {
        this.selectedVehicleId = log.vehicleId;
        this.selectedDate = this.formatDateForDisplay(log.serviceDate);
        this.odometerValue = log.mileageAtService;
        this.selectedMechanic = log.mechanicName || '';
        this.newMechanicName = '';
        this.showNewMechanicInput = !log.mechanicName;
        this.jobs = [...(log.jobs || [])]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((job, index) => ({
            id: index + 1,
            isPersisted: true,
            title: job.title,
            icon: job.icon || 'wrench',
            types: [...(job.maintenanceTypes || [])],
            description: job.description || '',
            items: (job.items || []).map((item) => ({
              name: item.name,
              qty: item.quantity,
              unitCost: item.unitCost,
              subtotal: item.quantity * item.unitCost,
            })),
            serviceCost: job.cost || 0,
          }));
        this.updateCurrentMileage();
        this.isLoadingLog = false;
      },
      error: (error) => {
        console.error('Error loading log for editing:', error);
        this.isLoadingLog = false;
      },
    });
  }

  private formatDateForDisplay(dateString: string): string {
    const date = new Date(`${dateString}T00:00:00`);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  onVehicleChange(vehicleId: string | number): void {
    this.selectedVehicleId = vehicleId.toString();
    this.updateCurrentMileage();
  }

  private updateCurrentMileage(): void {
    const vehicle = this.vehicles.find((v) => v.id === this.selectedVehicleId);
    this.currentVehicleMileage = vehicle?.currentMileage || 0;
    if (!this.isEditMode || this.odometerValue === null) {
      this.odometerValue = this.currentVehicleMileage;
    }
  }

  canSave(): boolean {
    if (this.isLoadingLog || this.jobs.length === 0) return false;
    return this.jobs.every(
      (job) =>
        job.title.trim().length > 0 &&
        job.types.length > 0 &&
        (this.isEditMode || job.items.length > 0),
    );
  }

  private loadMechanicNames(): void {
    this.logService.getMechanicNames().subscribe({
      next: (names) => {
        this.previousMechanics = names;
        if (names.length === 0 && !this.selectedMechanic) {
          // No previous mechanics - show new input immediately
          this.showNewMechanicInput = true;
        }
      },
      error: () => {
        if (!this.selectedMechanic) {
          this.showNewMechanicInput = true;
        }
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

  toggleMechanicDropdown(): void {
    this.mechanicDropdownOpen = !this.mechanicDropdownOpen;
  }

  closeMechanicDropdown(): void {
    this.mechanicDropdownOpen = false;
  }

  selectMechanic(name: string): void {
    this.selectedMechanic = name;
    this.showNewMechanicInput = false;
    this.mechanicDropdownOpen = false;
  }

  selectNewMechanic(): void {
    this.selectedMechanic = '';
    this.showNewMechanicInput = true;
    this.mechanicDropdownOpen = false;
    this.newMechanicName = '';
  }

  openDatePicker(): void {
    this.showDatePicker = true;
  }

  onDateChange(event: any): void {
    const isoValue = event?.detail?.value;
    if (isoValue) {
      const date = new Date(isoValue);
      this.selectedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
    this.showDatePicker = false;
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

  jobs: JobEntry[] = [];

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

  getJobIcon(iconName: string): LucideIconData {
    return this.iconMap[iconName] || WrenchIcon;
  }

  toggleTagDropdown(jobIndex: number): void {
    this.tagDropdownJobIndex =
      this.tagDropdownJobIndex === jobIndex ? null : jobIndex;
  }

  closeTagDropdown(): void {
    this.tagDropdownJobIndex = null;
  }

  addTagToJob(jobIndex: number, type: MaintenanceType): void {
    const job = this.jobs[jobIndex];
    if (!job.types.includes(type)) {
      job.types.push(type);
    }
    this.tagDropdownJobIndex = null;
  }

  getJobTotal(job: JobEntry): number {
    return job.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  getFullJobTotal(job: JobEntry): number {
    const itemsTotal = job.items.reduce((sum, item) => sum + item.subtotal, 0);
    return itemsTotal + (job.serviceCost || 0);
  }

  addJob(): void {
    const newId =
      this.jobs.reduce((maxId, job) => Math.max(maxId, job.id), 0) + 1;
    this.jobs.push({
      id: newId,
      isPersisted: false,
      title: '',
      icon: 'wrench',
      types: [],
      description: '',
      items: [],
      serviceCost: 0,
    });

    // The edit route is a full-page route and may not inherit the tabs shell's
    // scroll container. Once Angular renders the new card, bring it into view.
    setTimeout(() => {
      this.jobCards.last?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
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
    if (!this.canSave() || !this.selectedVehicleId || !this.selectedDate)
      return;

    this.saveErrorKey = '';

    const logData: CreateLogData = {
      serviceDate: this.formatDateForApi(),
      mileageAtService: this.odometerValue || this.currentVehicleMileage,
      mechanicName: this.effectiveMechanicName || undefined,
      jobs: this.jobs.map((job) => ({
        title: job.title,
        icon: job.icon || undefined,
        description: job.description || undefined,
        cost: job.serviceCost || undefined,
        maintenanceTypes: job.types,
        items: job.items.map((item) => ({
          name: item.name,
          quantity: item.qty,
          unitCost: item.unitCost,
        })),
      })),
    };

    if (this.isEditMode) {
      if (!this.editLogId) return;

      this.logService.updateLog(this.editLogId, logData).subscribe({
        next: () => {
          void this.router.navigate(['/log', this.editLogId]);
        },
        error: (err) => {
          console.error('Error updating log:', err);
          this.saveErrorKey = 'errors.updateLog';
        },
      });
      return;
    }

    this.logService.createLog(this.selectedVehicleId, logData).subscribe({
      next: () => {
        void this.router.navigate(['/tabs/vehicles']);
      },
      error: (err) => {
        console.error('Error creating log:', err);
        this.saveErrorKey = 'errors.logCreationFailed';
      },
    });
  }

  private formatDateForApi(): string {
    // selectedDate is formatted like "Jul 21, 2026" — parse it back to ISO date
    const date = new Date(this.selectedDate);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  }

  private discardUnsavedJobs(): void {
    if (!this.isEditMode) return;
    this.jobs = this.jobs.filter((job) => job.isPersisted);
  }

  goBack(): void {
    this.discardUnsavedJobs();
    if (this.isEditMode && this.editLogId) {
      void this.router.navigate(['/log', this.editLogId]);
      return;
    }
    void this.router.navigate(['/tabs/vehicles']);
  }
}
