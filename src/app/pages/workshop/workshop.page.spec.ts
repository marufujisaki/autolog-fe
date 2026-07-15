import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { WorkshopPage } from './workshop.page';
import { WorkshopService } from '../../core/ports/workshop.port';
import { AuthService } from '../../core/ports/auth.port';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { User, UserType, MechanicLevel } from '../../core/models/user.model';

describe('WorkshopPage', () => {
  let component: WorkshopPage;
  let fixture: ComponentFixture<WorkshopPage>;
  let mockWorkshopService: jasmine.SpyObj<WorkshopService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    mockWorkshopService = jasmine.createSpyObj('WorkshopService', [
      'getWorkshop',
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', [
      'instant',
    ]);

    const mechanicUser: User = {
      id: '123',
      email: 'mechanic@test.com',
      firstName: 'Juan',
      lastName: 'García',
      userType: UserType.MECANICO,
      mechanicLevel: 'SUPERVISOR' as MechanicLevel,
      workshopId: 'workshop-123',
      preferredLanguage: 'es',
    };

    const userSubject = new BehaviorSubject<User | null>(mechanicUser);
    Object.defineProperty(mockAuthService, 'user$', { value: userSubject });

    await TestBed.configureTestingModule({
      imports: [WorkshopPage, TranslatePipe],
      providers: [
        { provide: WorkshopService, useValue: mockWorkshopService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkshopPage);
    component = fixture.componentInstance;
    mockTranslateService.instant.and.returnValue('Mock translation');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load workshop when initialized with mechanic user', fakeAsync(() => {
    const mockWorkshop = {
      id: 'workshop-123',
      name: 'Taller Central',
      address: 'Calle Principal 123',
    };

    mockWorkshopService.getWorkshop.and.returnValue(of(mockWorkshop));

    fixture.detectChanges();

    tick();

    expect(component.workshop).toEqual(mockWorkshop);
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBeNull();
  }));

  it('should handle workshop loading error', fakeAsync(() => {
    mockWorkshopService.getWorkshop.and.returnValue(
      throwError(() => new Error('API error')),
    );

    fixture.detectChanges();

    tick();

    expect(component.workshop).toBeNull();
    expect(component.error).toBeTruthy();
    expect(component.isLoading).toBeFalse();
  }));

  it('should navigate back to profile on goBack', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should show loading state initially', fakeAsync(() => {
    const mockWorkshop = {
      id: 'workshop-123',
      name: 'Taller Central',
      address: 'Calle Principal 123',
    };

    mockWorkshopService.getWorkshop.and.returnValue(of(mockWorkshop));

    fixture.detectChanges();
    expect(component.isLoading).toBeTrue();

    tick();

    expect(component.isLoading).toBeFalse();
  }));
});
