import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ScanVehiclePage } from './scan-vehicle.page';
import { ShareService } from '../../core/ports/share.port';
import { AuthService } from '../../core/ports/auth.port';
import { VehicleDataRefreshService } from '../../core/services/vehicle-data-refresh.service';
import { User, UserType } from '../../core/models/user.model';

describe('ScanVehiclePage', () => {
  let component: ScanVehiclePage;
  let fixture: ComponentFixture<ScanVehiclePage>;
  let mockShareService: jasmine.SpyObj<ShareService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockDataRefresh: jasmine.SpyObj<VehicleDataRefreshService>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  const mechanicUser: User = {
    id: 'mechanic-1',
    email: 'mechanic@test.com',
    firstName: 'Juan',
    lastName: 'García',
    userType: UserType.MECHANIC,
    workshopId: 'workshop-123',
    preferredLanguage: 'es',
    allowSharing: false,
  };

  beforeEach(async () => {
    mockShareService = jasmine.createSpyObj('ShareService', ['claimShare']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isAuthenticated']);
    (mockAuthService as any).user = () => mechanicUser;
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDataRefresh = jasmine.createSpyObj('VehicleDataRefreshService', [
      'notifyChanged',
    ]);
    mockTranslateService = jasmine.createSpyObj('TranslateService', [
      'instant',
      'translate',
      'use',
      'get',
    ]);
    mockTranslateService.instant.and.callFake((key: string) => key);
    (mockTranslateService.get as any).and.callFake((key: string) => of(key));
    (mockTranslateService.translate as any).and.callFake((key: string) => {
      const signal: any = () => key;
      signal.set = () => {};
      signal.update = () => {};
      signal.asReadonly = () => signal;
      return signal;
    });

    await TestBed.configureTestingModule({
      imports: [ScanVehiclePage, TranslatePipe],
      providers: [
        { provide: ShareService, useValue: mockShareService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: VehicleDataRefreshService, useValue: mockDataRefresh },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScanVehiclePage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('claims the raw pasted token with the mechanic\'s own workshopId', () => {
    mockShareService.claimShare.and.returnValue(of(undefined));
    component.manualCodeControl.setValue('raw-token-abc');

    component.submitManualCode();

    expect(mockShareService.claimShare).toHaveBeenCalledWith(
      'raw-token-abc',
      'workshop-123',
    );
    expect(mockDataRefresh.notifyChanged).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tabs/vehicles']);
  });

  it('extracts the token from a pasted share URL query param', () => {
    mockShareService.claimShare.and.returnValue(of(undefined));
    component.manualCodeControl.setValue(
      'https://autolog.app/share?token=abc123',
    );

    component.submitManualCode();

    expect(mockShareService.claimShare).toHaveBeenCalledWith(
      'abc123',
      'workshop-123',
    );
  });

  it('does not submit when the manual code field is empty', () => {
    component.manualCodeControl.setValue('');

    component.submitManualCode();

    expect(mockShareService.claimShare).not.toHaveBeenCalled();
    expect(component.manualCodeControl.touched).toBeTrue();
  });

  it('surfaces the backend error message when claiming fails', () => {
    mockShareService.claimShare.and.returnValue(
      throwError(() => ({ error: { message: 'El token ha expirado' } })),
    );
    component.manualCodeControl.setValue('expired-token');

    component.submitManualCode();

    expect(component.errorMessage).toBe('El token ha expirado');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('shows a workshop-not-found error and skips the request when the mechanic has no workshopId', () => {
    (mockAuthService as any).user = () => ({ ...mechanicUser, workshopId: undefined });
    component.manualCodeControl.setValue('some-token');

    component.submitManualCode();

    expect(mockShareService.claimShare).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('share.workshopNotFound');
  });
});
