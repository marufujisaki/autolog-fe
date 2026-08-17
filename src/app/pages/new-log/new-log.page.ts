import {
  Component,
  ElementRef,
  effect,
  inject,
  signal,
  OnInit,
  input,
  output,
  viewChildren
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
import { MechanicService } from '../../core/ports/mechanic.port';
import { VehicleService } from '../../core/ports/vehicle.port';
import { VehicleDataRefreshService } from '../../core/services/vehicle-data-refresh.service';
import { Vehicle } from '../../core/models/vehicle.model';
import { CreateLogData, MaintenanceLog } from '../../core/models/maintenance-log.model';
import {
  CreateMechanicData,
  Mechanic,
  MechanicSource,
} from '../../core/models/mechanic.model';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { AutocompleteComponent } from '../../presentation/shared/components/autocomplete/autocomplete.component';
import { SwipeToDismissDirective } from '../../presentation/shared/directives/swipe-to-dismiss.directive';
import { SwipeToRevealDirective } from '../../presentation/shared/directives/swipe-to-reveal.directive';
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
  FilterIcon,
  DropletsIcon,
  ThermometerIcon,
  FlaskRoundIcon,
  SprayCanIcon,
  CircleDotIcon,
  GripVerticalIcon,
  CircleIcon,
  MoveHorizontalIcon,
  ScaleIcon,
  ZapIcon,
  ClockIcon,
  SettingsIcon,
  ScanLineIcon,
  BatteryIcon,
  BoltIcon,
  PowerIcon,
  LightbulbIcon,
  ZapOffIcon,
  ArrowDownUpIcon,
  ArrowUpDownIcon,
  LinkIcon,
  CogIcon,
  Link2Icon,
  Volume2Icon,
  FlameIcon,
  PaintbrushIcon,
  HammerIcon,
  SquareIcon,
  CloudRainIcon,
  WavesIcon,
  SparklesIcon,
  TruckIcon,
  XIcon,
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
    SwipeToDismissDirective,
    SwipeToRevealDirective,
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
  private mechanicService = inject(MechanicService);
  private vehicleService = inject(VehicleService);
  private route = inject(ActivatedRoute);
  private dataRefresh = inject(VehicleDataRefreshService);

  private readonly vehiclesResource = this.vehicleService.getVehiclesResource();
  private readonly mechanicsResource = this.mechanicService.getMechanicsResource();

  /** Idle (no fetch) until ngOnInit sets it, in edit mode only. */
  private readonly editLogIdSignal = signal('');
  private readonly logResource = this.logService.getLogResource(this.editLogIdSignal);

  constructor() {
    effect(() => {
      const vehicles = this.vehiclesResource.value();
      if (!vehicles) return;
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
    });

    effect(() => {
      const mechanics = this.mechanicsResource.value();
      if (mechanics) {
        this.mechanics = mechanics;
      }
    });

    effect(() => {
      const log = this.logResource.value();
      if (log) {
        this.applyLogForEdit(log);
      }
      if (this.logResource.error()) {
        console.error('Error loading log for editing:', this.logResource.error());
        this.isLoadingLog = false;
      }
    });
  }

  /** When true the page is rendered as an overlay and closing emits instead of navigating. */
  readonly presentedAsModal = input(false);
  readonly dismissed = output<void>();

  private readonly jobCards = viewChildren('jobCard', { read: ElementRef });
  private readonly jobTitleInputs = viewChildren('jobTitleInput', { read: AutocompleteComponent });

  /** Max length of `jobs.title` in the DB (V1__create_schema.sql) — mirrored here so the front rejects the same input the backend would. */
  readonly jobTitleMaxLength = 255;

  /** Row index currently showing the editable title input instead of the wrapped, read-only display. */
  editingTitleJobIndex: number | null = null;

  /** `"${jobIndex}-${type}"` of the one tag currently showing its remove (X) button. */
  private revealedTagKey: string | null = null;

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
  readonly XIcon = XIcon;

  // Icon map for job types — covers every icon slug in the job_options
  // catalog seed data (V1__create_schema.sql), so every catalog suggestion
  // shows its own icon instead of silently falling back to the generic
  // wrench for anything not listed here.
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
    filter: FilterIcon,
    droplets: DropletsIcon,
    thermometer: ThermometerIcon,
    'flask-round': FlaskRoundIcon,
    'spray-can': SprayCanIcon,
    'circle-dot': CircleDotIcon,
    'grip-vertical': GripVerticalIcon,
    circle: CircleIcon,
    'move-horizontal': MoveHorizontalIcon,
    scale: ScaleIcon,
    zap: ZapIcon,
    clock: ClockIcon,
    settings: SettingsIcon,
    'scan-line': ScanLineIcon,
    battery: BatteryIcon,
    bolt: BoltIcon,
    power: PowerIcon,
    lightbulb: LightbulbIcon,
    'zap-off': ZapOffIcon,
    'arrow-down-up': ArrowDownUpIcon,
    'arrow-up-down': ArrowUpDownIcon,
    link: LinkIcon,
    cog: CogIcon,
    'link-2': Link2Icon,
    'volume-2': Volume2Icon,
    flame: FlameIcon,
    paintbrush: PaintbrushIcon,
    hammer: HammerIcon,
    square: SquareIcon,
    'cloud-rain': CloudRainIcon,
    waves: WavesIcon,
    sparkles: SparklesIcon,
    truck: TruckIcon,
  };

  /** Every selectable slug for the manual icon picker, in the same order as iconMap. */
  readonly iconOptions: string[] = Object.keys(this.iconMap);

  /** Row index currently showing the manual icon picker popup. */
  iconPickerJobIndex: number | null = null;

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
  mechanics: Mechanic[] = [];
  selectedMechanicId = '';
  newMechanicName = '';
  mechanicDropdownOpen = false;

  ngOnInit(): void {
    this.editLogId = this.route.snapshot.paramMap.get('logId') || '';
    this.isEditMode = Boolean(this.editLogId);
    this.selectedVehicleId =
      this.route.snapshot.paramMap.get('vehicleId') || '';

    // Vehicles/mechanics load automatically via the resources' own initial
    // fetch (see constructor effects) — nothing to trigger here.
    if (this.isEditMode) {
      this.isLoadingLog = true;
      this.editLogIdSignal.set(this.editLogId);
    }
  }

  private applyLogForEdit(log: MaintenanceLog): void {
    this.selectedVehicleId = log.vehicleId;
    this.selectedDate = this.formatDateForDisplay(log.serviceDate);
    this.odometerValue = log.mileageAtService;
    this.selectedMechanicId = log.mechanicId || '';
    this.newMechanicName = log.mechanicName || '';
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

  /** Mechanics matching what's currently typed (full list when empty), for the dropdown. */
  filteredMechanics(): Mechanic[] {
    const query = this.newMechanicName.trim().toLowerCase();
    if (!query) return this.mechanics;
    return this.mechanics.filter((m) => m.name.toLowerCase().includes(query));
  }

  /** True when the typed text doesn't exactly match an existing mechanic. */
  showAddMechanicOption(): boolean {
    const name = this.newMechanicName.trim();
    if (!name) return false;
    return !this.mechanics.some(
      (m) => m.name.toLowerCase() === name.toLowerCase(),
    );
  }

  onMechanicNameChange(value: string): void {
    // Free typing invalidates a previous selection unless it still matches exactly.
    const exact = this.mechanics.find((m) => m.name === value);
    this.selectedMechanicId = exact ? exact.id : '';
    this.mechanicDropdownOpen = true;
  }

  openMechanicDropdown(): void {
    this.mechanicDropdownOpen = true;
  }

  closeMechanicDropdown(): void {
    this.mechanicDropdownOpen = false;
  }

  selectMechanic(mechanic: Mechanic): void {
    this.selectedMechanicId = mechanic.id;
    this.newMechanicName = mechanic.name;
    this.mechanicDropdownOpen = false;
  }

  /** Creates a new personal mechanic with just the typed name — no phone/description upfront. */
  addNewMechanic(): void {
    const name = this.newMechanicName.trim();
    if (!name) return;

    const data: CreateMechanicData = {
      source: MechanicSource.PERSONAL,
      name,
    };
    this.mechanicService.createMechanic(data).subscribe({
      next: (mechanic) => {
        this.mechanics = [...this.mechanics, mechanic];
        this.selectedMechanicId = mechanic.id;
        this.newMechanicName = mechanic.name;
        this.mechanicDropdownOpen = false;
      },
      error: (error) => {
        console.error('Error creating mechanic:', error);
        this.saveErrorKey = 'mechanics.saveError';
      },
    });
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

  // Add/Edit Item popup state
  showAddItemPopup = false;
  activeJobIndex = 0;
  /** Index of the item being edited within the active job, or null when the popup is adding a new one. */
  editingItemIndex: number | null = null;
  newItemDescription = '';
  newItemQuantity = '';
  newItemUnitCost = '';

  /** `"${jobIndex}-${itemIndex}"` of the one item row currently swiped open. */
  revealedItemKey: string | null = null;

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

  /** Typing in the title field (as opposed to picking a suggestion) — clearing it resets the icon back to the default. */
  onJobTitleChange(jobIndex: number, value: string): void {
    // A job that starts with an empty title shows the autocomplete purely
    // via the `!job.title` fallback in the template (no explicit edit
    // session yet, since the user never had to click a display div to get
    // here). The instant the first character lands, `!job.title` goes
    // false — without marking this row as the active edit session here too,
    // `[hidden]` immediately re-evaluates to true on that very keystroke,
    // hiding the input the user is still typing into mid-word.
    this.editingTitleJobIndex = jobIndex;
    const job = this.jobs[jobIndex];
    job.title = value;
    if (!value.trim()) {
      job.icon = 'wrench';
    }
  }

  /** Switches a job's title from its wrapped, read-only display into the editable autocomplete, then focuses it. */
  startEditingTitle(jobIndex: number): void {
    this.editingTitleJobIndex = jobIndex;
    setTimeout(() => this.jobTitleInputs()[jobIndex]?.focus());
  }

  /** Leaving the title field switches back to the wrapped display — never while it's empty (there'd be nothing to click back into). */
  onJobTitleBlur(jobIndex: number): void {
    if (this.editingTitleJobIndex === jobIndex) {
      this.editingTitleJobIndex = null;
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

  getJobIcon(iconName: string): LucideIconData {
    return this.iconMap[iconName] || WrenchIcon;
  }

  toggleIconPicker(jobIndex: number): void {
    this.iconPickerJobIndex =
      this.iconPickerJobIndex === jobIndex ? null : jobIndex;
  }

  closeIconPicker(): void {
    this.iconPickerJobIndex = null;
  }

  selectJobIcon(jobIndex: number, iconName: string): void {
    this.jobs[jobIndex].icon = iconName;
    this.iconPickerJobIndex = null;
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

  private tagKey(jobIndex: number, type: MaintenanceType): string {
    return `${jobIndex}-${type}`;
  }

  /** A tag's remove (X) button only shows once the tag itself has been clicked — this toggles that reveal. */
  onTagClick(jobIndex: number, type: MaintenanceType): void {
    const key = this.tagKey(jobIndex, type);
    this.revealedTagKey = this.revealedTagKey === key ? null : key;
  }

  isTagRemovable(jobIndex: number, type: MaintenanceType): boolean {
    return this.revealedTagKey === this.tagKey(jobIndex, type);
  }

  removeTagFromJob(jobIndex: number, type: MaintenanceType): void {
    const job = this.jobs[jobIndex];
    job.types = job.types.filter((t) => t !== type);
    this.revealedTagKey = null;
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
      const cards = this.jobCards();
      cards[cards.length - 1]?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  }

  deleteJob(index: number): void {
    this.jobs.splice(index, 1);
  }

  // --- Add/Edit Item Popup ---

  openAddItemPopup(jobIndex: number): void {
    this.activeJobIndex = jobIndex;
    this.editingItemIndex = null;
    this.newItemDescription = '';
    this.newItemQuantity = '';
    this.newItemUnitCost = '';
    this.showAddItemPopup = true;
  }

  /** Opens the same popup pre-filled with an existing item's values, in-place edit mode. */
  openEditItemPopup(jobIndex: number, itemIndex: number): void {
    const item = this.jobs[jobIndex].items[itemIndex];
    this.activeJobIndex = jobIndex;
    this.editingItemIndex = itemIndex;
    this.newItemDescription = item.name;
    this.newItemQuantity = String(item.qty);
    this.newItemUnitCost = String(item.unitCost);
    this.showAddItemPopup = true;
    this.closeItemReveal();
  }

  closeAddItemPopup(): void {
    this.showAddItemPopup = false;
    this.editingItemIndex = null;
  }

  confirmAddItem(): void {
    const qty = parseInt(this.newItemQuantity, 10) || 0;
    const unitCost = parseFloat(this.newItemUnitCost) || 0;

    if (this.newItemDescription.trim() && qty > 0) {
      const item: JobItem = {
        name: this.newItemDescription.trim(),
        qty,
        unitCost,
        subtotal: qty * unitCost,
      };
      if (this.editingItemIndex !== null) {
        this.jobs[this.activeJobIndex].items[this.editingItemIndex] = item;
      } else {
        this.jobs[this.activeJobIndex].items.push(item);
      }
    }

    this.closeAddItemPopup();
  }

  deleteItem(jobIndex: number, itemIndex: number): void {
    this.jobs[jobIndex].items.splice(itemIndex, 1);
    this.closeItemReveal();
  }

  private itemKey(jobIndex: number, itemIndex: number): string {
    return `${jobIndex}-${itemIndex}`;
  }

  isItemRevealed(jobIndex: number, itemIndex: number): boolean {
    return this.revealedItemKey === this.itemKey(jobIndex, itemIndex);
  }

  onItemRevealedChange(jobIndex: number, itemIndex: number, revealed: boolean): void {
    this.revealedItemKey = revealed ? this.itemKey(jobIndex, itemIndex) : null;
  }

  closeItemReveal(): void {
    this.revealedItemKey = null;
  }

  saveLog(): void {
    if (!this.canSave() || !this.selectedVehicleId || !this.selectedDate)
      return;

    this.saveErrorKey = '';

    const logData: CreateLogData = {
      serviceDate: this.formatDateForApi(),
      mileageAtService: this.odometerValue || this.currentVehicleMileage,
      mechanicId: this.selectedMechanicId || undefined,
      mechanicName: this.newMechanicName.trim() || undefined,
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
        this.dataRefresh.notifyChanged();
        this.goBack();
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
    if (this.presentedAsModal()) {
      // TODO: The 'emit' function requires a mandatory void argument
      this.dismissed.emit();
      return;
    }

    if (this.isEditMode && this.editLogId) {
      void this.router.navigate(['/log', this.editLogId]);
      return;
    }
    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
    const destination =
      returnTo === '/tabs/profile' ? '/tabs/profile' : '/tabs/vehicles';
    void this.router.navigateByUrl(destination);
  }
}
