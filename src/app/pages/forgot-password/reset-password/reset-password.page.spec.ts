import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';

import { ResetPasswordPage } from './reset-password.page';
import { AuthService } from '../../../core/ports/auth.port';

describe('ResetPasswordPage', () => {
  let component: ResetPasswordPage;
  let fixture: ComponentFixture<ResetPasswordPage>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockTranslateService: jasmine.SpyObj<TranslateService>;

  async function createComponent(queryParams: Record<string, string>): Promise<void> {
    mockAuthService = jasmine.createSpyObj('AuthService', ['resetPassword']);
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
      imports: [ResetPasswordPage, TranslatePipe],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: TranslateService, useValue: mockTranslateService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { queryParamMap: convertToParamMap(queryParams) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create and capture the email from the query params', async () => {
    await createComponent({ email: 'user@example.com' });
    expect(component).toBeTruthy();
    expect(component.email).toBe('user@example.com');
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('redirects back to step 1 when no email query param is present', async () => {
    await createComponent({});
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/forgot-password']);
  });

  it('flags a mismatch between password and confirmPassword', async () => {
    await createComponent({ email: 'user@example.com' });
    component.passwordControl.setValue('longEnough123');
    component.confirmPasswordControl.setValue('somethingElse456');

    expect(component.form.hasError('passwordMismatch')).toBeTrue();
  });

  it('does not submit when passwords do not match', async () => {
    await createComponent({ email: 'user@example.com' });
    component.passwordControl.setValue('longEnough123');
    component.confirmPasswordControl.setValue('somethingElse456');
    component.codeControl.setValue('123456');

    component.onSubmit();

    expect(mockAuthService.resetPassword).not.toHaveBeenCalled();
  });

  it('calls resetPassword and navigates to /login on success', async () => {
    await createComponent({ email: 'user@example.com' });
    mockAuthService.resetPassword.and.returnValue(of(undefined));
    component.passwordControl.setValue('longEnough123');
    component.confirmPasswordControl.setValue('longEnough123');
    component.codeControl.setValue('123456');

    component.onSubmit();

    expect(mockAuthService.resetPassword).toHaveBeenCalledWith(
      'user@example.com',
      '123456',
      'longEnough123',
    );
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('surfaces the backend error message and does not navigate on failure', async () => {
    await createComponent({ email: 'user@example.com' });
    mockAuthService.resetPassword.and.returnValue(
      throwError(() => ({ error: { message: 'Invalid reset code' } })),
    );
    component.passwordControl.setValue('longEnough123');
    component.confirmPasswordControl.setValue('longEnough123');
    component.codeControl.setValue('000000');

    component.onSubmit();

    expect(component.errorMessage()).toBe('Invalid reset code');
    expect(mockRouter.navigate).not.toHaveBeenCalledWith(['/login']);
  });

  it('falls back to a translated message when the backend gives none', async () => {
    await createComponent({ email: 'user@example.com' });
    mockAuthService.resetPassword.and.returnValue(throwError(() => ({})));
    component.passwordControl.setValue('longEnough123');
    component.confirmPasswordControl.setValue('longEnough123');
    component.codeControl.setValue('000000');

    component.onSubmit();

    expect(component.errorMessage()).toBe('auth.resetPasswordError');
  });

  it('goBack() navigates to /forgot-password', async () => {
    await createComponent({ email: 'user@example.com' });
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/forgot-password']);
  });
});
