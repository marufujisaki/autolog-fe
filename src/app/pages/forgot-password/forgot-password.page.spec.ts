import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ForgotPasswordPage } from './forgot-password.page';
import { AuthService } from '../../core/ports/auth.port';

describe('ForgotPasswordPage', () => {
  let component: ForgotPasswordPage;
  let fixture: ComponentFixture<ForgotPasswordPage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['requestPasswordReset']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
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
      imports: [ForgotPasswordPage, TranslatePipe],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordPage);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not submit an invalid email', () => {
    component.emailControl.setValue('not-an-email');

    component.onSubmit();

    expect(mockAuthService.requestPasswordReset).not.toHaveBeenCalled();
  });

  it('requests a reset code and navigates to step 2 with the email on success', () => {
    mockAuthService.requestPasswordReset.and.returnValue(of(undefined));
    component.emailControl.setValue('user@example.com');

    component.onSubmit();

    expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith('user@example.com');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/forgot-password/reset'], {
      queryParams: { email: 'user@example.com' },
    });
    expect(component.isLoading()).toBeFalse();
  });

  it('shows an error and stays on the page when the request fails', () => {
    mockAuthService.requestPasswordReset.and.returnValue(
      throwError(() => new Error('network error')),
    );
    component.emailControl.setValue('user@example.com');

    component.onSubmit();

    expect(component.errorKey()).toBe('auth.resetRequestError');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('resendCode() re-sends without navigating and starts a cooldown', fakeAsync(() => {
    mockAuthService.requestPasswordReset.and.returnValue(of(undefined));
    component.emailControl.setValue('user@example.com');

    component.resendCode();

    expect(mockAuthService.requestPasswordReset).toHaveBeenCalledWith('user@example.com');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(component.resendCooldown()).toBe(30);

    tick(1000);
    expect(component.resendCooldown()).toBe(29);

    // Clean up the running interval so the test doesn't leak timers.
    component.ngOnDestroy();
  }));

  it('resendCode() is a no-op while the cooldown is active', () => {
    mockAuthService.requestPasswordReset.and.returnValue(of(undefined));
    component.emailControl.setValue('user@example.com');
    component.resendCode();
    mockAuthService.requestPasswordReset.calls.reset();

    component.resendCode();

    expect(mockAuthService.requestPasswordReset).not.toHaveBeenCalled();
    component.ngOnDestroy();
  });

  it('goBack() navigates to /login', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
