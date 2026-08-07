import { Component, OnDestroy, OnInit, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../core/ports/auth.port';
import { MechanicService } from '../../core/ports/mechanic.port';
import {
  CreateMechanicData,
  Mechanic,
  MechanicSource,
} from '../../core/models/mechanic.model';
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
  LogOutIcon,
  PencilIcon,
  PlusIcon,
  UserRoundIcon,
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

  userName = '';
  userEmail = '';
  userPhone = '';
  userType: UserType = UserType.USUARIO;

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

  userTypeOptions: SelectOption[] = [];

  private readonly mechanicsResource = this.mechanicService.getMechanicsResource();

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

    // `user`/`profile`/`mechanics` are all synced by the effects in the constructor.
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private buildUserTypeOptions(): void {
    this.userTypeOptions = [
      UserType.USUARIO,
      UserType.CLIENTE,
      UserType.MECANICO,
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
      userType: [UserType.USUARIO, [Validators.required]],
    });
  }

  openEditProfile(): void {
    this.profileErrorKey = '';
    this.profileForm.reset({
      firstName: this.currentUser?.firstName ?? '',
      lastName: this.currentUser?.lastName ?? '',
      email: this.userEmail,
      phone: this.userPhone,
      userType: this.userType,
    });
    this.showEditProfileModal = true;
  }

  closeEditProfile(): void {
    this.showEditProfileModal = false;
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
      userType: raw.userType ?? UserType.USUARIO,
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

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }

  private showToast(messageKey: string, type: 'success' | 'error'): void {
    this.toastMessage = messageKey;
    this.toastType = type;
    this.toastVisible = true;
  }
}
