import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ProfilePage } from './profile.page';
import { AuthService } from '../../core/ports/auth.port';
import { Router } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { User, UserType } from '../../core/models/user.model';
import { MechanicService } from '../../core/ports/mechanic.port';
import { Mechanic, MechanicSource } from '../../core/models/mechanic.model';

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let mockMechanicService: jasmine.SpyObj<MechanicService>;
  let userSubject: BehaviorSubject<User | null>;

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
    userType: UserType.USUARIO,
    preferredLanguage: 'es',
    allowSharing: false,
  };

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', [
      'logout',
      'getProfile',
      'updateProfile',
    ]);
    mockAuthService.getProfile.and.returnValue(of(testUser));
    mockAuthService.updateProfile.and.returnValue(of(testUser));

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockTranslateService = jasmine.createSpyObj(
      'TranslateService',
      ['instant', 'get', 'use'],
      { onLangChange: of() },
    );
    mockTranslateService.instant.and.callFake((key: string) => key);
    (mockTranslateService.get as jasmine.Spy).and.callFake((key: string) =>
      of(key),
    );

    mockMechanicService = jasmine.createSpyObj('MechanicService', [
      'getMechanics',
      'getMechanic',
      'createMechanic',
      'updateMechanic',
      'deleteMechanic',
    ]);
    mockMechanicService.getMechanics.and.returnValue(of([]));
    mockMechanicService.getMechanic.and.returnValue(of(testMechanic));
    mockMechanicService.createMechanic.and.returnValue(of(testMechanic));
    mockMechanicService.updateMechanic.and.returnValue(of(testMechanic));
    mockMechanicService.deleteMechanic.and.returnValue(of(void 0));

    userSubject = new BehaviorSubject<User | null>(testUser);
    Object.defineProperty(mockAuthService, 'user$', {
      value: userSubject.asObservable(),
    });

    await TestBed.configureTestingModule({
      imports: [ProfilePage],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
        { provide: MechanicService, useValue: mockMechanicService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load user name, email and phone on initialization', fakeAsync(() => {
    component.ngOnInit();
    tick();

    expect(component.userName).toBe('John Doe');
    expect(component.userEmail).toBe('test@example.com');
    expect(component.userPhone).toBe('+584120000000');
    expect(mockAuthService.getProfile).toHaveBeenCalled();
  }));

  it('should start with empty identity values', () => {
    expect(component.userName).toBe('');
    expect(component.userEmail).toBe('');
  });

  it('should keep empty values when the user is null', fakeAsync(() => {
    // Sin sesion no hay perfil disponible: ni el stream de usuario ni la
    // consulta al backend aportan datos.
    mockAuthService.getProfile.and.returnValue(
      throwError(() => new Error('unauthenticated')),
    );
    userSubject.next(null);
    component.ngOnInit();
    tick();

    expect(component.userName).toBe('');
    expect(component.userEmail).toBe('');
  }));

  it('should build the user type options from translations', () => {
    component.ngOnInit();

    expect(component.userTypeOptions.length).toBe(3);
    expect(component.userTypeOptions[0].value).toBe(UserType.USUARIO);
  });

  it('should prefill the edit form from the loaded profile', fakeAsync(() => {
    component.ngOnInit();
    tick();

    component.openEditProfile();

    expect(component.showEditProfileModal).toBeTrue();
    expect(component.firstNameControl.value).toBe('John');
    expect(component.lastNameControl.value).toBe('Doe');
    expect(component.emailControl.value).toBe('test@example.com');
  }));

  it('should submit the profile update and close the modal', fakeAsync(() => {
    component.ngOnInit();
    tick();
    component.openEditProfile();

    component.saveProfile();
    tick();

    expect(mockAuthService.updateProfile).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'test@example.com',
      phone: '+584120000000',
      userType: UserType.USUARIO,
    });
    expect(component.showEditProfileModal).toBeFalse();
  }));

  it('should surface an error key when the profile update fails', fakeAsync(() => {
    mockAuthService.updateProfile.and.returnValue(
      throwError(() => new Error('failed')),
    );
    component.ngOnInit();
    tick();
    component.openEditProfile();

    component.saveProfile();
    tick();

    expect(component.profileErrorKey).toBe('profile.updateError');
    expect(component.showEditProfileModal).toBeTrue();
  }));

  it('should navigate to the settings screen', () => {
    component.openSettings();

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/settings']);
  });

  it('should create a personal mechanic through the service and list it', () => {
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
    mockMechanicService.getMechanics.and.returnValue(of([testMechanic]));

    component.ngOnInit();
    tick();

    expect(mockMechanicService.getMechanics).toHaveBeenCalled();
    expect(component.mechanics).toEqual([testMechanic]);
  }));

  it('should remove a mechanic through the service', () => {
    component.mechanics = [{ ...testMechanic }];

    component.deleteMechanic(component.mechanics[0]);

    expect(mockMechanicService.deleteMechanic).toHaveBeenCalledWith(
      testMechanic.id,
    );
    expect(component.mechanics.length).toBe(0);
  });

  it('should logout and navigate to home', () => {
    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/']);
  });
});
