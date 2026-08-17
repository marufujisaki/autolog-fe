import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { signal } from '@angular/core';
import { HttpResourceRef } from '@angular/common/http';
import { WorkshopPage } from './workshop.page';
import { WorkshopService, Workshop } from '../../core/ports/workshop.port';
import { AuthService } from '../../core/ports/auth.port';
import { Router } from '@angular/router';
import { TranslateService, TranslatePipe } from '@ngx-translate/core';
import { of } from 'rxjs';
import { User, UserType, MechanicLevel } from '../../core/models/user.model';

/**
 * Minimal fake matching the subset of HttpResourceRef<T> the components
 * under test actually call (.value()/.isLoading()/.error()/.reload()).
 * `as unknown as HttpResourceRef<T>` bypasses structural typing for the
 * members we don't need to fake (set/update/hasValue/status/destroy/...).
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

describe('WorkshopPage', () => {
  let component: WorkshopPage;
  let fixture: ComponentFixture<WorkshopPage>;
  let mockWorkshopService: jasmine.SpyObj<WorkshopService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;
  let fakeWorkshopResource: ReturnType<typeof createFakeResource<Workshop>>;

  const mechanicUser: User = {
    id: '123',
    email: 'mechanic@test.com',
    firstName: 'Juan',
    lastName: 'García',
    userType: UserType.MECHANIC,
    mechanicLevel: 'SUPERVISOR' as MechanicLevel,
    workshopId: 'workshop-123',
    preferredLanguage: 'es',
    allowSharing: false,
  };

  beforeEach(async () => {
    fakeWorkshopResource = createFakeResource<Workshop>();
    mockWorkshopService = jasmine.createSpyObj('WorkshopService', [
      'getWorkshopResource',
    ]);
    mockWorkshopService.getWorkshopResource.and.returnValue(
      fakeWorkshopResource,
    );

    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    (mockAuthService as any).user = () => mechanicUser;

    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockTranslateService = jasmine.createSpyObj('TranslateService', [
      'instant',
      'translate',
      'use',
      'get',
    ]);
    (mockTranslateService.translate as any).and.callFake((key: string) => {
      const signal: any = () => key;
      signal.set = () => {};
      signal.update = () => {};
      signal.asReadonly = () => signal;
      return signal;
    });
    mockTranslateService.instant.and.callFake((key: string) => key);
    (mockTranslateService.get as any).and.callFake((key: string) => of(key));

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
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load workshop when initialized with mechanic user', fakeAsync(() => {
    const mockWorkshop: Workshop = {
      id: 'workshop-123',
      name: 'Taller Central',
      address: 'Calle Principal 123',
    };

    fixture.detectChanges();
    fakeWorkshopResource.setValue(mockWorkshop);
    fixture.detectChanges();
    tick();

    expect(component.workshop).toEqual(mockWorkshop);
    expect(component.isLoading).toBeFalse();
    expect(component.error).toBeNull();
  }));

  it('should handle workshop loading error', fakeAsync(() => {
    fixture.detectChanges();
    fakeWorkshopResource.setError(new Error('API error'));
    fixture.detectChanges();
    tick();

    expect(component.error).toBeTruthy();
  }));

  it('should navigate back to profile on goBack', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('should show loading state initially', fakeAsync(() => {
    fakeWorkshopResource.setLoading(true);
    fixture.detectChanges();

    expect(component.isLoading).toBeTrue();
  }));
});
