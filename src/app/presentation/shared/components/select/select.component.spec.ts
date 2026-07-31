import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent } from './select.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;
  let debugSelect: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    debugSelect = fixture.debugElement.query(By.css('ion-select'));
  });

  function emitSelection(value: string | number): void {
    component.onSelectionChange({ detail: { value } });
    fixture.detectChanges();
  }

  function emitBlur(): void {
    component.onBlur();
  }

  describe('Ionic rendering', () => {
    it('should render an ion-select and no native select', () => {
      expect(debugSelect).toBeTruthy();
      expect(fixture.debugElement.query(By.css('select'))).toBeNull();
      expect(fixture.debugElement.queryAll(By.css('ion-select')).length).toBe(
        1,
      );
    });

    it('should render provided ion-select-option elements', () => {
      component.options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
        { value: '3', label: 'Option 3' },
      ];
      fixture.detectChanges();

      const options = fixture.debugElement.queryAll(
        By.css('ion-select-option'),
      );
      expect(options.length).toBe(3);
      expect(options[0].componentInstance.value).toBe('1');
      expect(options[0].nativeElement.textContent).toContain('Option 1');
    });

    it('should preserve numeric option values and disabled state', () => {
      component.options = [
        { value: 1, label: 'First' },
        { value: 2, label: 'Second', disabled: true },
      ];
      fixture.detectChanges();

      const options = fixture.debugElement.queryAll(
        By.css('ion-select-option'),
      );
      expect(options[0].componentInstance.value).toBe(1);
      expect(options[1].componentInstance.disabled).toBeTrue();
    });

    it('should render an optional label associated with the ion-select id', () => {
      component.label = 'Select vehicle';
      fixture.detectChanges();

      const label = fixture.debugElement.query(By.css('label'));
      expect(label.nativeElement.textContent).toContain('Select vehicle');
      expect(label.nativeElement.getAttribute('for')).toBe(component.selectId);
      expect(debugSelect.nativeElement.id).toBe(component.selectId);
    });

    it('should render the placeholder on ion-select', () => {
      component.placeholder = 'Choose a vehicle';
      fixture.detectChanges();

      expect(debugSelect.componentInstance.placeholder).toBe(
        'Choose a vehicle',
      );
    });
  });

  describe('Validation and state', () => {
    it('should not display an error by default', () => {
      expect(fixture.debugElement.query(By.css('[role="alert"]'))).toBeNull();
    });

    it('should display an error with role alert', () => {
      component.errorMessage = 'Please select a valid option';
      fixture.detectChanges();

      const error = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(error).toBeTruthy();
      expect(error.nativeElement.textContent).toContain(
        'Please select a valid option',
      );
      expect(debugSelect.nativeElement.getAttribute('aria-invalid')).toBe(
        'true',
      );
    });

    it('should reflect disabled state on ion-select', () => {
      component.setDisabledState(true);
      fixture.detectChanges();

      expect(component.disabled).toBeTrue();
      expect(debugSelect.componentInstance.disabled).toBeTrue();
    });
  });

  describe('ControlValueAccessor', () => {
    it('should update the value from ionChange', () => {
      component.options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];
      fixture.detectChanges();

      emitSelection('option2');

      expect(component.value).toBe('option2');
    });

    it('should update the component value when writeValue is called', () => {
      component.writeValue('uk');
      fixture.detectChanges();

      expect(component.value).toBe('uk');
      expect(debugSelect.componentInstance.value).toBe('uk');
    });

    it('should normalize null values to an empty value', () => {
      component.writeValue(null as never);
      fixture.detectChanges();

      expect(component.value).toBe('');
      expect(debugSelect.componentInstance.value).toBe('');
    });

    it('should call onChange when ionChange emits', () => {
      const onChange = jasmine.createSpy('onChange');
      component.registerOnChange(onChange);

      emitSelection('2');

      expect(onChange).toHaveBeenCalledOnceWith('2');
    });

    it('should call onTouched when ionBlur emits', () => {
      const onTouched = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouched);

      emitBlur();

      expect(onTouched).toHaveBeenCalledTimes(1);
    });

    it('should work with a reactive FormControl', () => {
      const control = new FormControl('initial-value');
      component.registerOnChange((value) => control.setValue(String(value)));
      component.writeValue(control.value ?? '');
      fixture.detectChanges();

      emitSelection('other-value');

      expect(control.value).toBe('other-value');
    });
  });

  describe('Identity and options updates', () => {
    it('should generate a unique id for each instance', () => {
      const secondFixture = TestBed.createComponent(SelectComponent);
      expect(component.selectId).not.toBe(
        secondFixture.componentInstance.selectId,
      );
      secondFixture.destroy();
    });

    it('should keep the same id across change detection', () => {
      const initialId = component.selectId;
      fixture.detectChanges();
      expect(component.selectId).toBe(initialId);
    });

    it('should update ionic options dynamically', () => {
      component.options = [{ value: '1', label: 'Option 1' }];
      fixture.detectChanges();
      expect(
        fixture.debugElement.queryAll(By.css('ion-select-option')).length,
      ).toBe(1);

      component.options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      fixture.detectChanges();

      expect(
        fixture.debugElement.queryAll(By.css('ion-select-option')).length,
      ).toBe(2);
    });
  });
});
