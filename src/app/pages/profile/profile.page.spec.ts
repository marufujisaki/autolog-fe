import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpResourceRef } from '@angular/common/http';
import { ProfilePage } from './profile.page';
import { AuthService } from '../../core/ports/auth.port';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { User, UserType } from '../../core/models/user.model';
import { MechanicService } from '../../core/ports/mechanic.port';
import { Mechanic, MechanicSource } from '../../core/models/mechanic.model';
import { Workshop, WorkshopService } from '../../core/ports/workshop.port';
import { ClientService } from '../../core/ports/client.port';
import { Client } from '../../core/models/client.model';

/**
 * Minimal fake matching the subset of HttpResourceRef<T> the component
 * actually calls (.value()/.isLoading()/.error()). `as unknown as
 * HttpResourceRef<T>` bypasses structural typing for unused members.
 */
function createFakeResource<T>() {
  const valueSignal = signal<T | undefined>(undefined);
  const errorSignal = signal<unknown>(undefined);
  const isLoadingSignal = signal(false);
  const fake = {
    value: valueSignal,
    error: errorSignal,
    isLoading: isLoadingSignal,
    reload: () => true,
    setValue: (v: T | undefined) => valueSignal.set(v),
    setError: (e: unknown) => errorSignal.set(e),
    setLoading: (l: boolean) => isLoadingSignal.set(l),
  };
  return fake as typeof fake & HttpResourceRef<T>;
}

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockMechanicService: jasmine.SpyObj<MechanicService>;
  let mockWorkshopService: jasmine.SpyObj<WorkshopService>;
  let mockClientService: jasmine.SpyObj<ClientService>;
  let userSignal: ReturnType<typeof signal<User | null>>;
  let fakeProfileResource: ReturnType<typeof createFakeResource<User>>;
  let fakeMechanicsResource: ReturnType<typeof createFakeResource<Mechanic[]>>;
  let fakeWorkshopsResource: ReturnType<typeof createFakeResource<Workshop[]>>;
  let fakeClientsResource: ReturnType<typeof createFakeResource<Client[]>>;

  const testMechanic: Mechanic = {
    id: 'mechanic-1',
    source: MechanicSource.PERSONAL,
    ownerUserId: 'user-123',
    name: 'Taller La Candelaria',
    phone: '+584120483325',
    description: 'Sr Gerardo',
    active: true,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };

  const testUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+584120000000',
    userType: UserType.OWNER,
    preferredLanguage: 'es',
    allowSharing: false,
  };

  /**
   * Component construction (field initializers + constructor effects) is
   * where auth/mechanics data loading now happens — so tests that need a
   * specific initial mock state (e.g. no user) must set it up BEFORE
   * calling this, not after.
   */
  function createComponent(): void {
    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
  }

  beforeEach(async () => {
    userSignal = signal<User | null>(testUser);
    fakeProfileResource = createFakeResource<User>();
    fakeMechanicsResource = createFakeResource<Mechanic[]>();
    fakeMechanicsResource.setValue([]);
    fakeWorkshopsResource = createFakeResource<Workshop[]>();
    fakeWorkshopsResource.setValue([]);
    fakeClientsResource = createFakeResource<Client[]>();
    fakeClientsResource.setValue([]);

    mockAuthService = jasmine.createSpyObj('AuthService', [
      'logout',
      'updateProfile',
    ]);
    (mockAuthService as any).user = userSignal;
    (mockAuthService as any).profile = fakeProfileResource;
    mockAuthService.updateProfile.and.returnValue(of(testUser));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockTranslateService = jasmine.createSpyObj(
      'TranslateService',
      ['instant', 'get', 'use', 'translate'],
      { onLangChange: of() },
    );
    mockTranslateService.instant.and.callFake((key: string) => key);
    (mockTranslateService.get as jasmine.Spy).and.callFake((key: string) =>
      of(key),
    );
    (mockTranslateService.translate as jasmine.Spy).and.callFake(
      (key: string) => {
        const signal: any = () => key;
        signal.set = () => {};
        signal.update = () => {};
        signal.asReadonly = () => signal;
        return signal;
      },
    );

    mockMechanicService = jasmine.createSpyObj('MechanicService', [
      'getMechanicsResource',
      'getMechanicResource',
      'createMechanic',
      'updateMechanic',
      'deleteMechanic',
    ]);
    mockMechanicService.getMechanicsResource.and.returnValue(
      fakeMechanicsResource,
    );
    mockMechanicService.createMechanic.and.returnValue(of(testMechanic));
    mockMechanicService.updateMechanic.and.returnValue(of(testMechanic));
    mockMechanicService.deleteMechanic.and.returnValue(of(void 0));

    mockWorkshopService = jasmine.createSpyObj('WorkshopService', [
      'getWorkshopResource',
      'getWorkshopsResource',
    ]);
    mockWorkshopService.getWorkshopsResource.and.returnValue(
      fakeWorkshopsResource,
    );

    mockClientService = jasmine.createSpyObj('ClientService', [
      'getClientsResource',
    ]);
    mockClientService.getClientsResource.and.returnValue(fakeClientsResource);

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MechanicService, useValue: mockMechanicService },
        { provide: WorkshopService, useValue: mockWorkshopService },
        { provide: ClientService, useValue: mockClientService },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should load user name, email and phone on initialization', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick();

    expect(component.userName).toBe('John Doe');
    expect(component.userEmail).toBe('test@example.com');
    expect(component.userPhone).toBe('+584120000000');
  }));

  it('should keep empty values when the user is null', fakeAsync(() => {
    // Sin sesion no hay perfil disponible: ni la signal de usuario ni la
    // consulta al backend aportan datos.
    userSignal.set(null);
    createComponent();
    fixture.detectChanges();
    tick();

    expect(component.userName).toBe('');
    expect(component.userEmail).toBe('');
  }));

  it('should build the user type options from translations', () => {
    createComponent();
    component.ngOnInit();

    expect(component.userTypeOptions.length).toBe(3);
    expect(component.userTypeOptions[0].value).toBe(UserType.OWNER);
  });

  it('should prefill the edit form from the loaded profile', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick();

    component.openEditProfile();

    expect(component.showEditProfileModal).toBeTrue();
    expect(component.firstNameControl.value).toBe('John');
    expect(component.lastNameControl.value).toBe('Doe');
    expect(component.emailControl.value).toBe('test@example.com');
  }));

  it('should submit the profile update and close the modal', fakeAsync(() => {
    createComponent();
    fixture.detectChanges();
    tick();
    component.openEditProfile();

    component.saveProfile();
    tick();

    expect(mockAuthService.updateProfile).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '+584120000000',
      userType: UserType.OWNER,
    });
    expect(component.showEditProfileModal).toBeFalse();
  }));

  it('should surface an error key when the profile update fails', fakeAsync(() => {
    mockAuthService.updateProfile.and.returnValue(
      throwError(() => new Error('failed')),
    );
    createComponent();
    fixture.detectChanges();
    tick();
    component.openEditProfile();

    component.saveProfile();
    tick();

    expect(component.profileErrorKey).toBe('profile.updateError');
    expect(component.showEditProfileModal).toBeTrue();
  }));

  it('should navigate to the settings screen', () => {
    createComponent();
    component.openSettings();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/settings']);
  });

  it('should create a personal mechanic through the service and list it', () => {
    createComponent();
    component.onMechanicAdded({
      name: 'Taller La Candelaria',
      phone: '+584120483325',
      description: 'Sr Gerardo',
    });

    expect(mockMechanicService.createMechanic).toHaveBeenCalledWith({
      source: MechanicSource.PERSONAL,
      name: 'Taller La Candelaria',
      phone: '+584120483325',
      description: 'Sr Gerardo',
    });
    expect(component.mechanics.length).toBe(1);
    expect(component.mechanics[0].name).toBe('Taller La Candelaria');
    expect(component.mechanics[0].phone).toBe('+584120483325');
    expect(component.showAddMechanicModal).toBeFalse();
  });

  it('should load the mechanics directory on initialization', fakeAsync(() => {
    fakeMechanicsResource.setValue([testMechanic]);
    createComponent();
    fixture.detectChanges();
    tick();

    expect(mockMechanicService.getMechanicsResource).toHaveBeenCalled();
    expect(component.mechanics).toEqual([testMechanic]);
  }));

  it('should remove a mechanic through the service', () => {
    createComponent();
    component.mechanics = [{ ...testMechanic }];

    component.deleteMechanic(component.mechanics[0]);

    expect(mockMechanicService.deleteMechanic).toHaveBeenCalledWith(
      testMechanic.id,
    );
    expect(component.mechanics.length).toBe(0);
  });

  it('should load the client list for a mechanic user instead of the mechanics directory', fakeAsync(() => {
    const mechanicUser: User = { ...testUser, userType: UserType.MECHANIC, workshopId: 'workshop-1' };
    const testClient: Client = {
      id: 'owner-1',
      name: 'Juan Perez',
      phone: '+584120000001',
      email: 'juan@autolog.com',
      vehicles: [{ id: 'vehicle-1', brand: 'Jeep', model: 'Grand Cherokee' }],
    };
    userSignal.set(mechanicUser);
    fakeClientsResource.setValue([testClient]);

    createComponent();
    fixture.detectChanges();
    tick();

    expect(component.isMechanicUser()).toBeTrue();
    expect(mockClientService.getClientsResource).toHaveBeenCalled();
    expect(component.clients).toEqual([testClient]);
    expect(component.formatClientVehicles(testClient)).toBe('Jeep Grand Cherokee');
  }));

  it('should show a confirmation modal before logging out', () => {
    createComponent();
    component.openLogoutConfirm();

    expect(component.showLogoutConfirmModal).toBeTrue();
    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });

  it('should not logout when the confirmation is cancelled', () => {
    createComponent();
    component.openLogoutConfirm();
    component.closeLogoutConfirm();

    expect(component.showLogoutConfirmModal).toBeFalse();
    expect(mockAuthService.logout).not.toHaveBeenCalled();
  });

  it('should logout once the confirmation is accepted', () => {
    // Navigation to /login is AuthService.logout()'s own responsibility
    // (see HttpAuthService) — this page just has to trigger it, not
    // duplicate the navigation itself.
    createComponent();
    component.openLogoutConfirm();
    component.confirmLogout();

    expect(component.showLogoutConfirmModal).toBeFalse();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });
});
