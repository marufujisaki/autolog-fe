import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InputComponent } from './input.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { provideTranslateService } from '@ngx-translate/core';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;
  let nativeInput: HTMLInputElement;
  let debugInput: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent, ReactiveFormsModule],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    debugInput = fixture.debugElement.query(By.css('input'));
    nativeInput = debugInput.nativeElement;
    fixture.detectChanges();
  });

  describe('Input Type', () => {
    it('should default to type "text"', () => {
      expect(component.type()).toBe('text');
      expect(nativeInput.type).toBe('text');
    });

    it('should set type to "password"', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      expect(nativeInput.type).toBe('password');
    });

    it('should set type to "search"', () => {
      fixture.componentRef.setInput('type', 'search');
      fixture.detectChanges();
      expect(nativeInput.type).toBe('search');
    });
  });

  describe('Placeholder', () => {
    it('should have empty placeholder by default', () => {
      expect(component.placeholder()).toBe('');
    });

    it('should set placeholder text', () => {
      fixture.componentRef.setInput('placeholder', 'Enter email');
      fixture.detectChanges();
      expect(nativeInput.placeholder).toBe('Enter email');
    });
  });

  describe('Label', () => {
    it('should not display label when not provided', () => {
      const label = fixture.debugElement.query(By.css('label'));
      expect(label).toBeNull();
    });

    it('should display label when provided', () => {
      fixture.componentRef.setInput('label', 'Email address');
      fixture.detectChanges();
      const label = fixture.debugElement.query(By.css('label'));
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent).toContain('Email address');
    });

    it('should associate label with input using id', () => {
      fixture.componentRef.setInput('label', 'Username');
      fixture.detectChanges();
      const label = fixture.debugElement.query(By.css('label'));
      expect(label.nativeElement.getAttribute('for')).toBe(component.inputId);
      expect(nativeInput.id).toBe(component.inputId);
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      expect(component.disabled()).toBe(false);
      expect(nativeInput.disabled).toBe(false);
    });

    it('should apply disabled attribute when disabled is true', () => {
      fixture.componentRef.setInput('disabled', true);
      fixture.detectChanges();
      expect(nativeInput.disabled).toBe(true);
    });
  });

  describe('Validation States', () => {
    it('should default to "default" state', () => {
      expect(component.state()).toBe('default');
      expect(component.resolvedState).toBe('default');
    });

    it('should set state to "error"', () => {
      fixture.componentRef.setInput('state', 'error');
      fixture.detectChanges();
      expect(component.resolvedState).toBe('error');
      expect(nativeInput.classList.contains('app-input--error')).toBe(true);
    });

    it('should set state to "success"', () => {
      fixture.componentRef.setInput('state', 'success');
      fixture.detectChanges();
      expect(component.resolvedState).toBe('success');
      expect(nativeInput.classList.contains('app-input--success')).toBe(true);
    });

    it('should automatically resolve to error state when errorMessage is present', () => {
      fixture.componentRef.setInput('errorMessage', 'Email is invalid');
      fixture.detectChanges();
      expect(component.resolvedState).toBe('error');
    });

    it('should keep explicit state even with errorMessage present', () => {
      fixture.componentRef.setInput('state', 'success');
      fixture.componentRef.setInput('errorMessage', 'This should not override');
      fixture.detectChanges();
      expect(component.resolvedState).toBe('success');
    });
  });

  describe('Error Message Display', () => {
    it('should not display error message by default', () => {
      const errorMsg = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(errorMsg).toBeNull();
    });

    it('should display error message when provided', () => {
      fixture.componentRef.setInput('errorMessage', 'This field is required');
      fixture.detectChanges();
      const errorMsg = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.nativeElement.textContent).toContain(
        'This field is required',
      );
    });

    it('should include role="alert" for accessibility', () => {
      fixture.componentRef.setInput('errorMessage', 'Validation error');
      fixture.detectChanges();
      const errorMsg = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(errorMsg.nativeElement.getAttribute('role')).toBe('alert');
    });
  });

  describe('Password Visibility Toggle', () => {
    it('should default to hidden password', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      expect(component.showPassword).toBe(false);
      expect(nativeInput.type).toBe('password');
    });

    it('should show password when toggled', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      component.togglePasswordVisibility();
      fixture.detectChanges();
      expect(component.showPassword).toBe(true);
      expect(component.nativeType).toBe('text');
    });

    it('should hide password again when toggled', () => {
      fixture.componentRef.setInput('type', 'password');
      component.togglePasswordVisibility();
      component.togglePasswordVisibility();
      expect(component.showPassword).toBe(false);
      expect(component.nativeType).toBe('password');
    });

    it('should not have toggle button for non-password types', () => {
      fixture.componentRef.setInput('type', 'text');
      fixture.detectChanges();
      const toggleBtn = fixture.debugElement.query(
        By.css('.app-input__password-toggle'),
      );
      expect(toggleBtn).toBeNull();
    });

    it('should have toggle button for password type', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.detectChanges();
      const toggleBtn = fixture.debugElement.query(
        By.css('.app-input__password-toggle'),
      );
      expect(toggleBtn).toBeTruthy();
    });
  });

  describe('ControlValueAccessor - Two-Way Binding', () => {
    it('should update component value on input change', () => {
      nativeInput.value = 'test value';
      nativeInput.dispatchEvent(new Event('input'));
      expect(component.value).toBe('test value');
    });

    it('should update input when writeValue is called', () => {
      component.writeValue('external value');
      fixture.detectChanges();
      expect(nativeInput.value).toBe('external value');
    });

    it('should handle null values gracefully', () => {
      component.writeValue(null as any);
      fixture.detectChanges();
      expect(nativeInput.value).toBe('');
    });

    it('should call onChange when value changes', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);

      nativeInput.value = 'new value';
      nativeInput.dispatchEvent(new Event('input'));

      expect(onChangeSpy).toHaveBeenCalledWith('new value');
    });

    it('should call onTouched when input loses focus', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      nativeInput.dispatchEvent(new Event('blur'));

      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should respect disabled state from setDisabledState', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      expect(component.isDisabled()).toBe(true);
      expect(nativeInput.disabled).toBe(true);
    });
  });

  describe('With Reactive Forms', () => {
    it('should work with FormControl', () => {
      const control = new FormControl('initial value');
      component.writeValue(control.value || '');
      fixture.detectChanges();

      expect(nativeInput.value).toBe('initial value');
    });

    it('should update form control when input changes', () => {
      const control = new FormControl('');
      const onChangeFn = (value: string) => control.setValue(value);
      component.registerOnChange(onChangeFn);

      nativeInput.value = 'updated value';
      nativeInput.dispatchEvent(new Event('input'));

      expect(control.value).toBe('updated value');
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-input elements', () => {
      const ionInput = fixture.debugElement.query(By.css('ion-input'));
      expect(ionInput).toBeNull();
    });

    it('should only render native input element', () => {
      const nativeInputs = fixture.debugElement.queryAll(By.css('input'));
      const ionInputs = fixture.debugElement.queryAll(By.css('ion-input'));
      expect(nativeInputs.length).toBeGreaterThan(0);
      expect(ionInputs.length).toBe(0);
    });
  });

  describe('Unique ID Generation', () => {
    it('should generate unique ID for each instance', () => {
      const fixture2 = TestBed.createComponent(InputComponent);
      const component2 = fixture2.componentInstance;

      expect(component.inputId).not.toEqual(component2.inputId);
    });

    it('should maintain consistent ID across change detection', () => {
      const initialId = component.inputId;
      fixture.detectChanges();
      expect(component.inputId).toBe(initialId);
    });
  });

  describe('Combination Tests', () => {
    it('should handle password input with error state', () => {
      fixture.componentRef.setInput('type', 'password');
      fixture.componentRef.setInput('errorMessage', 'Password is too weak');
      fixture.componentRef.setInput('label', 'Password');
      fixture.detectChanges();

      expect(nativeInput.type).toBe('password');
      expect(component.resolvedState).toBe('error');
      expect(
        fixture.debugElement.query(By.css('label')).nativeElement.textContent,
      ).toContain('Password');
    });

    it('should handle complete form input scenario', () => {
      const control = new FormControl('');
      const onChangeSpy = jasmine.createSpy('onChange');
      const onTouchedSpy = jasmine.createSpy('onTouched');

      fixture.componentRef.setInput('type', 'text');
      fixture.componentRef.setInput('placeholder', 'Enter email');
      fixture.componentRef.setInput('label', 'Email');
      component.registerOnChange(onChangeSpy);
      component.registerOnTouched(onTouchedSpy);
      fixture.detectChanges();

      nativeInput.value = 'test@example.com';
      nativeInput.dispatchEvent(new Event('input'));
      nativeInput.dispatchEvent(new Event('blur'));

      expect(onChangeSpy).toHaveBeenCalledWith('test@example.com');
      expect(onTouchedSpy).toHaveBeenCalled();
    });
  });
});
