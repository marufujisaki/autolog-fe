import { Component, OnDestroy, OnInit, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/ports/auth.port';
import { MechanicService } from '../../core/ports/mechanic.port';
import { WorkshopService } from '../../core/ports/workshop.port';
import { ClientService } from '../../core/ports/client.port';
import {
  CreateMechanicData,
  Mechanic,
  MechanicSource,
} from '../../core/models/mechanic.model';
import { Client } from '../../core/models/client.model';
import {
  UpdateProfileData,
  User,
  UserType,
} from '../../core/models/user.model';
import { BrandComponent } from '../../presentation/shared/components/brand/brand.component';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import { InputComponent } from '../../presentation/shared/components/input/input.component';
import { ModalComponent } from '../../presentation/shared/components/modal/modal.component';
import {
  SelectComponent,
  SelectOption,
} from '../../presentation/shared/components/select/select.component';
import { ToastComponent } from '../../presentation/shared/components/toast/toast.component';
import {
  AddMechanicModalComponent,
  MechanicDraft,
} from '../../presentation/shared/components/add-mechanic-modal/add-mechanic-modal.component';
import {
  LucideAngularModule,
  ChevronRightIcon,
  EllipsisVerticalIcon,
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  UserRoundIcon,
  UsersIcon,
  WrenchIcon,
  Trash2Icon,
} from 'lucide-angular';

interface MechanicEntry extends Mechanic {
  source: MechanicSource;
}

/**
 * ProfilePage — User identity block, profile editing, settings entry and
 * mechanics directory (Figma frame "Profile - Client / Personal").
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslatePipe,
    LucideAngularModule,
    BrandComponent,
    ButtonComponent,
    InputComponent,
    ModalComponent,
    SelectComponent,
    ToastComponent,
    AddMechanicModalComponent,
  ],
})
export class ProfilePage implements OnInit, OnDestroy {
  private readonly authService = inject(AuthService);
  private readonly mechanicService = inject(MechanicService);
  private readonly workshopService = inject(WorkshopService);
  private readonly clientService = inject(ClientService);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  private readonly translate = inject(TranslateService);
  private readonly destroy$ = new Subject<void>();

  readonly PencilIcon = PencilIcon;
  readonly PlusIcon = PlusIcon;
  readonly WrenchIcon = WrenchIcon;
  readonly Trash2Icon = Trash2Icon;
  readonly LogOutIcon = LogOutIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly UserRoundIcon = UserRoundIcon;
  readonly UsersIcon = UsersIcon;
  readonly EllipsisVerticalIcon = EllipsisVerticalIcon;

  openMechanicMenuId: string | null = null;

  userName = '';
  userEmail = '';
  userPhone = '';
  userType: UserType = UserType.OWNER;

  private currentUser: User | null = null;

  profileForm!: FormGroup;
  showEditProfileModal = false;
  isSavingProfile = false;
  profileErrorKey = '';

  showAddMechanicModal = false;
  editingMechanic: MechanicEntry | null = null;

  toastMessage = '';
  toastType: 'success' | 'error' = 'success';
  toastVisible = false;

  /** Mechanics visible to the authenticated user, loaded from the API. */
  mechanics: MechanicEntry[] = [];

  /** Owners of vehicles shared with this MECHANIC's workshop, loaded from the API. */
  clients: Client[] = [];

  userTypeOptions: SelectOption[] = [];

  /** MECHANIC users see a "client list" section instead of the "mechanics" directory. */
  readonly isMechanicUser = computed(
    () => this.authService.user()?.userType === UserType.MECHANIC,
  );

  private readonly mechanicsResource = this.mechanicService.getMechanicsResource();
  private readonly workshopsResource = this.workshopService.getWorkshopsResource();
  private readonly clientsResource = this.clientService.getClientsResource(this.isMechanicUser);
  readonly workshopOptions = computed<SelectOption[]>(() =>
    (this.workshopsResource.value() ?? []).map((workshop) => ({
      value: workshop.id,
      label: workshop.name,
    })),
  );

  /** Placeholder — the workshop self-registration web form doesn't exist yet. */
  private readonly workshopRegistrationUrl = 'https://autolog.app/registro-taller';

  /** Last userType change the user actually committed to (via confirmation or a direct OWNER pick). Reverts to on cancel. */
  private confirmedUserType: UserType = UserType.OWNER;

  showClienteConfirmModal = false;
  showMecanicoConfirmModal = false;
  mecanicoStep: 'confirm' | 'selectWorkshop' = 'confirm';
  selectedWorkshopId = '';

  showLogoutConfirmModal = false;

  constructor() {
    effect(() => {
      const mechanics = this.mechanicsResource.value();
      if (mechanics) {
        this.mechanics = mechanics as MechanicEntry[];
      }
      if (this.mechanicsResource.error()) {
        this.showToast('mechanics.loadError', 'error');
      }
    });

    effect(() => {
      const clients = this.clientsResource.value();
      if (clients) {
        this.clients = clients;
      }
      if (this.clientsResource.error()) {
        this.showToast('clients.loadError', 'error');
      }
    });

    // Bridges the auth signal into this page's plain fields until this
    // whole page converts to signal-based state (tracked separately) —
    // effect() is the sanctioned pattern for syncing a signal into a
    // non-signal system, which is exactly what these fields are today.
    // Field initializers run too early for `this.loadMechanics` etc., so
    // this lives in the constructor (still a valid injection context).
    effect(() => {
      const user = this.authService.user();
      if (!user) return;
      this.currentUser = user;
      this.userName = `${user.firstName} ${user.lastName}`.trim();
      this.userEmail = user.email;
      this.userPhone = user.phone ?? '';
      this.userType = user.userType;
    });

    effect(() => {
      if (this.authService.profile.error()) {
        this.showToast('profile.loadError', 'error');
      }
    });
  }

  get firstNameControl(): FormControl<string> {
    return this.profileForm.get('firstName') as FormControl<string>;
  }

  get lastNameControl(): FormControl<string> {
    return this.profileForm.get('lastName') as FormControl<string>;
  }

  get emailControl(): FormControl<string> {
    return this.profileForm.get('email') as FormControl<string>;
  }

  get phoneControl(): FormControl<string> {
    return this.profileForm.get('phone') as FormControl<string>;
  }

  get userTypeControl(): FormControl<UserType> {
    return this.profileForm.get('userType') as FormControl<UserType>;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.buildUserTypeOptions();
    this.translate.onLangChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.buildUserTypeOptions());
    this.userTypeControl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((newType) => this.handleUserTypeChange(newType));

    // `user`/`profile`/`mechanics` are all synced by the effects in the constructor.
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildUserTypeOptions(): void {
    this.userTypeOptions = [
      UserType.OWNER,
      UserType.CLIENT,
      UserType.MECHANIC,
    ].map((type) => ({
      value: type,
      label: this.translate.instant(`userTypes.${type}`),
    }));
  }

  private initializeForm(): void {
    this.profileForm = this.formBuilder.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(255)],
      ],
      phone: ['', [Validators.maxLength(30)]],
      userType: [UserType.OWNER, [Validators.required]],
    });
  }

  openEditProfile(): void {
    this.profileErrorKey = '';
    this.confirmedUserType = this.userType;
    this.selectedWorkshopId = '';
    this.showClienteConfirmModal = false;
    this.showMecanicoConfirmModal = false;
    this.mecanicoStep = 'confirm';
    // emitEvent: false — this restores the currently-saved userType, which
    // never needs the CLIENT/MECHANIC confirmation flow triggered below.
    this.profileForm.reset(
      {
        firstName: this.currentUser?.firstName ?? '',
        lastName: this.currentUser?.lastName ?? '',
        email: this.userEmail,
        phone: this.userPhone,
        userType: this.userType,
      },
      { emitEvent: false },
    );
    this.showEditProfileModal = true;
  }

  closeEditProfile(): void {
    this.showEditProfileModal = false;
  }

  /** Intercepts CLIENT/MECHANIC picks on the userType select to run their confirmation flow before the change sticks. */
  private handleUserTypeChange(newType: UserType): void {
    if (newType === this.confirmedUserType) return;

    if (newType === UserType.CLIENT) {
      this.showClienteConfirmModal = true;
      return;
    }

    if (newType === UserType.MECHANIC) {
      this.mecanicoStep = 'confirm';
      this.selectedWorkshopId = '';
      this.showMecanicoConfirmModal = true;
      return;
    }

    this.confirmedUserType = newType;
  }

  confirmClienteChange(): void {
    this.confirmedUserType = UserType.CLIENT;
    this.showClienteConfirmModal = false;
  }

  cancelClienteChange(): void {
    this.showClienteConfirmModal = false;
    this.userTypeControl.setValue(this.confirmedUserType, { emitEvent: false });
  }

  /** "Sí" on "is your workshop already registered?" — reveals the workshop picker in the same popup. */
  confirmWorkshopRegistered(): void {
    this.mecanicoStep = 'selectWorkshop';
  }

  /** "No" — redirects to the (future) workshop self-registration form and reverts the pending userType change. */
  declineWorkshopRegistered(): void {
    window.open(this.workshopRegistrationUrl, '_blank', 'noopener');
    this.cancelMecanicoChange();
  }

  /** Closing the popup without finishing (backdrop/close button) reverts the same as declining, minus the redirect. */
  closeMecanicoModal(): void {
    this.cancelMecanicoChange();
  }

  confirmWorkshopSelection(): void {
    if (!this.selectedWorkshopId) return;
    this.confirmedUserType = UserType.MECHANIC;
    this.showMecanicoConfirmModal = false;
    this.mecanicoStep = 'confirm';
  }

  private cancelMecanicoChange(): void {
    this.showMecanicoConfirmModal = false;
    this.mecanicoStep = 'confirm';
    this.selectedWorkshopId = '';
    this.userTypeControl.setValue(this.confirmedUserType, { emitEvent: false });
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.isSavingProfile) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const raw = this.profileForm.getRawValue();
    const data: UpdateProfileData = {
      firstName: (raw.firstName ?? '').trim(),
      lastName: (raw.lastName ?? '').trim(),
      email: (raw.email ?? '').trim(),
      phone: (raw.phone ?? '').trim(),
      userType: raw.userType ?? UserType.OWNER,
      ...(raw.userType === UserType.MECHANIC &&
        this.selectedWorkshopId && { workshopId: this.selectedWorkshopId }),
    };

    this.isSavingProfile = true;
    this.profileErrorKey = '';
    this.authService
      .updateProfile(data)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.isSavingProfile = false;
          this.showEditProfileModal = false;
          this.showToast('profile.updateSuccess', 'success');
        },
        error: () => {
          this.isSavingProfile = false;
          this.profileErrorKey = 'profile.updateError';
        },
      });
  }

  openSettings(): void {
    void this.router.navigate(['/tabs/settings']);
  }

  toggleMechanicMenu(mechanicId: string, event: Event): void {
    event.stopPropagation();
    this.openMechanicMenuId =
      this.openMechanicMenuId === mechanicId ? null : mechanicId;
  }

  closeMechanicMenu(): void {
    this.openMechanicMenuId = null;
  }

  openAddMechanic(): void {
    this.editingMechanic = null;
    this.showAddMechanicModal = true;
  }

  openEditMechanic(mechanic: MechanicEntry): void {
    this.editingMechanic = mechanic;
    this.showAddMechanicModal = true;
  }

  closeAddMechanic(): void {
    this.showAddMechanicModal = false;
    this.editingMechanic = null;
  }

  onMechanicAdded(draft: MechanicDraft): void {
    const data: CreateMechanicData = {
      source: this.editingMechanic?.source ?? MechanicSource.PERSONAL,
      name: draft.name,
      phone: draft.phone || undefined,
      description: draft.description || undefined,
    };
    const request = this.editingMechanic
      ? this.mechanicService.updateMechanic(this.editingMechanic.id, data)
      : this.mechanicService.createMechanic(data);
    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (mechanic) => {
        this.mechanics = this.editingMechanic
          ? this.mechanics.map((item) =>
              item.id === mechanic.id ? mechanic : item,
            )
          : [...this.mechanics, mechanic];
        this.closeAddMechanic();
      },
      error: () => this.showToast('mechanics.saveError', 'error'),
    });
  }

  deleteMechanic(mechanic: MechanicEntry): void {
    this.mechanicService
      .deleteMechanic(mechanic.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.mechanics = this.mechanics.filter(
            (item) => item.id !== mechanic.id,
          );
          this.showToast('mechanics.deleteSuccess', 'success');
        },
        error: () => this.showToast('mechanics.deleteError', 'error'),
      });
  }

  /** "Brand Model, Brand Model" summary for a client's shared vehicles. */
  formatClientVehicles(client: Client): string {
    return client.vehicles.map((vehicle) => `${vehicle.brand} ${vehicle.model}`).join(', ');
  }

  private loadMechanics(): void {
    // Kept as a method for call-site compatibility with existing mutation
    // handlers that re-trigger a reload; the actual fetch is the
    // mechanicsResource field's effect (see constructor) reacting to
    // mechanicsResource.reload().
    this.mechanicsResource.reload();
  }

  /** Resolves a translatable error key for an invalid, touched control. */
  controlError(control: FormControl<string>): string {
    if (!control || control.valid || !control.touched) return '';
    if (control.hasError('required')) return 'validation.required';
    if (control.hasError('email')) return 'validation.email';
    if (control.hasError('maxlength')) return 'errors.maxLength';
    return 'errors.invalidField';
  }

  openLogoutConfirm(): void {
    this.showLogoutConfirmModal = true;
  }

  closeLogoutConfirm(): void {
    this.showLogoutConfirmModal = false;
  }

  confirmLogout(): void {
    this.showLogoutConfirmModal = false;
    this.authService.logout();
  }

  private showToast(messageKey: string, type: 'success' | 'error'): void {
    this.toastMessage = messageKey;
    this.toastType = type;
    this.toastVisible = true;
  }
}
