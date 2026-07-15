import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SelectComponent, SelectOption } from './select.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

describe('SelectComponent', () => {
  let component: SelectComponent;
  let fixture: ComponentFixture<SelectComponent>;
  let nativeSelect: HTMLSelectElement;
  let debugSelect: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectComponent, ReactiveFormsModule],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectComponent);
    component = fixture.componentInstance;
    debugSelect = fixture.debugElement.query(By.css('select'));
    nativeSelect = debugSelect.nativeElement;
    fixture.detectChanges();
  });

  describe('Options Rendering', () => {
    it('should render provided options', () => {
      component.options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
        { value: '3', label: 'Option 3' },
      ];
      fixture.detectChanges();

      const options = fixture.debugElement.queryAll(By.css('option'));
      expect(options.length).toBe(3);
    });

    it('should set correct option values and labels', () => {
      component.options = [
        { value: 'us', label: 'United States' },
        { value: 'uk', label: 'United Kingdom' },
      ];
      fixture.detectChanges();

      const options = fixture.debugElement.queryAll(By.css('option'));
      expect((options[0].nativeElement as HTMLOptionElement).value).toBe('us');
      expect(
        (options[0].nativeElement as HTMLOptionElement).textContent,
      ).toContain('United States');
      expect((options[1].nativeElement as HTMLOptionElement).value).toBe('uk');
      expect(
        (options[1].nativeElement as HTMLOptionElement).textContent,
      ).toContain('United Kingdom');
    });

    it('should handle numeric values', () => {
      component.options = [
        { value: 1, label: 'First' },
        { value: 2, label: 'Second' },
      ];
      fixture.detectChanges();

      const options = fixture.debugElement.queryAll(By.css('option'));
      expect((options[0].nativeElement as HTMLOptionElement).value).toBe('1');
    });

    it('should render empty options array', () => {
      component.options = [];
      fixture.detectChanges();

      const options = fixture.debugElement.queryAll(By.css('option'));
      expect(options.length).toBe(0);
    });
  });

  describe('Placeholder', () => {
    it('should have default placeholder text', () => {
      expect(component.placeholder).toBe('Select an option');
    });

    it('should render custom placeholder text', () => {
      component.placeholder = 'Choose a vehicle';
      fixture.detectChanges();

      expect(nativeSelect.getAttribute('placeholder')).toBe('Choose a vehicle');
    });
  });

  describe('Label', () => {
    it('should not display label when not provided', () => {
      const label = fixture.debugElement.query(By.css('label'));
      expect(label).toBeNull();
    });

    it('should display label when provided', () => {
      component.label = 'Select vehicle';
      fixture.detectChanges();
      const label = fixture.debugElement.query(By.css('label'));
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent).toContain('Select vehicle');
    });

    it('should associate label with select using id', () => {
      component.label = 'Maintenance type';
      fixture.detectChanges();
      const label = fixture.debugElement.query(By.css('label'));
      expect(label.nativeElement.getAttribute('for')).toBe(component.selectId);
      expect(nativeSelect.id).toBe(component.selectId);
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      expect(component.disabled).toBe(false);
      expect(nativeSelect.disabled).toBe(false);
    });

    it('should apply disabled attribute when disabled is true', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(nativeSelect.disabled).toBe(true);
    });

    it('should disable individual options', () => {
      component.options = [
        { value: '1', label: 'Active', disabled: false },
        { value: '2', label: 'Disabled', disabled: true },
      ];
      fixture.detectChanges();

      const options = fixture.debugElement.queryAll(By.css('option'));
      expect((options[0].nativeElement as HTMLOptionElement).disabled).toBe(
        false,
      );
      expect((options[1].nativeElement as HTMLOptionElement).disabled).toBe(
        true,
      );
    });
  });

  describe('Error Message Display', () => {
    it('should not display error message by default', () => {
      const errorMsg = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(errorMsg).toBeNull();
    });

    it('should display error message when provided', () => {
      component.errorMessage = 'Please select a valid option';
      fixture.detectChanges();
      const errorMsg = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(errorMsg).toBeTruthy();
      expect(errorMsg.nativeElement.textContent).toContain(
        'Please select a valid option',
      );
    });

    it('should include role="alert" for accessibility', () => {
      component.errorMessage = 'Selection error';
      fixture.detectChanges();
      const errorMsg = fixture.debugElement.query(By.css('[role="alert"]'));
      expect(errorMsg.nativeElement.getAttribute('role')).toBe('alert');
    });
  });

  describe('ControlValueAccessor - Two-Way Binding', () => {
    it('should update component value on selection change', () => {
      component.options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];
      fixture.detectChanges();

      nativeSelect.value = 'option2';
      nativeSelect.dispatchEvent(new Event('change'));

      expect(component.value).toBe('option2');
    });

    it('should update select when writeValue is called', () => {
      component.options = [
        { value: 'us', label: 'USA' },
        { value: 'uk', label: 'UK' },
      ];
      component.writeValue('uk');
      fixture.detectChanges();

      expect(nativeSelect.value).toBe('uk');
    });

    it('should handle null values gracefully', () => {
      component.writeValue(null as any);
      fixture.detectChanges();
      expect(nativeSelect.value).toBe('');
    });

    it('should call onChange when selection changes', () => {
      const onChangeSpy = jasmine.createSpy('onChange');
      component.registerOnChange(onChangeSpy);
      component.options = [
        { value: '1', label: 'One' },
        { value: '2', label: 'Two' },
      ];
      fixture.detectChanges();

      nativeSelect.value = '2';
      nativeSelect.dispatchEvent(new Event('change'));

      expect(onChangeSpy).toHaveBeenCalledWith('2');
    });

    it('should call onTouched when select loses focus', () => {
      const onTouchedSpy = jasmine.createSpy('onTouched');
      component.registerOnTouched(onTouchedSpy);

      nativeSelect.dispatchEvent(new Event('blur'));

      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should respect disabled state from setDisabledState', () => {
      component.setDisabledState(true);
      fixture.detectChanges();
      expect(component.disabled).toBe(true);
      expect(nativeSelect.disabled).toBe(true);
    });
  });

  describe('With Reactive Forms', () => {
    it('should work with FormControl', () => {
      const control = new FormControl('initial-value');
      component.options = [
        { value: 'initial-value', label: 'Initial' },
        { value: 'other-value', label: 'Other' },
      ];
      component.writeValue(control.value || '');
      fixture.detectChanges();

      expect(nativeSelect.value).toBe('initial-value');
    });

    it('should update form control when selection changes', () => {
      const control = new FormControl<string | number>('');
      const onChangeFn = (value: string | number) =>
        control.setValue(value as string | number);
      component.registerOnChange(onChangeFn);
      component.options = [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
      ];
      fixture.detectChanges();

      nativeSelect.value = 'option2';
      nativeSelect.dispatchEvent(new Event('change'));

      expect(control.value).toBe('option2');
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-select elements', () => {
      const ionSelect = fixture.debugElement.query(By.css('ion-select'));
      expect(ionSelect).toBeNull();
    });

    it('should only render native select element', () => {
      const nativeSelects = fixture.debugElement.queryAll(By.css('select'));
      const ionSelects = fixture.debugElement.queryAll(By.css('ion-select'));
      expect(nativeSelects.length).toBeGreaterThan(0);
      expect(ionSelects.length).toBe(0);
    });
  });

  describe('Unique ID Generation', () => {
    it('should generate unique ID for each instance', () => {
      const fixture2 = TestBed.createComponent(SelectComponent);
      const component2 = fixture2.componentInstance;

      expect(component.selectId).not.toEqual(component2.selectId);
    });

    it('should maintain consistent ID across change detection', () => {
      const initialId = component.selectId;
      fixture.detectChanges();
      expect(component.selectId).toBe(initialId);
    });
  });

  describe('Dynamic Options Update', () => {
    it('should update options dynamically', () => {
      component.options = [{ value: '1', label: 'Option 1' }];
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('option')).length).toBe(1);

      component.options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
        { value: '3', label: 'Option 3' },
      ];
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('option')).length).toBe(3);
    });

    it('should clear options when set to empty array', () => {
      component.options = [
        { value: '1', label: 'Option 1' },
        { value: '2', label: 'Option 2' },
      ];
      fixture.detectChanges();

      component.options = [];
      fixture.detectChanges();

      const options = fixture.debugElement.queryAll(By.css('option'));
      expect(options.length).toBe(0);
    });
  });

  describe('Combination Tests', () => {
    it('should handle complete select scenario', () => {
      const control = new FormControl('maintenance-type');
      const onChangeSpy = jasmine.createSpy('onChange');
      const onTouchedSpy = jasmine.createSpy('onTouched');

      component.label = 'Maintenance type';
      component.placeholder = 'Choose a type';
      component.options = [
        { value: 'maintenance-type', label: 'Maintenance' },
        { value: 'repair', label: 'Repair' },
        { value: 'inspection', label: 'Inspection' },
      ];
      component.registerOnChange(onChangeSpy);
      component.registerOnTouched(onTouchedSpy);
      fixture.detectChanges();

      nativeSelect.value = 'repair';
      nativeSelect.dispatchEvent(new Event('change'));
      nativeSelect.dispatchEvent(new Event('blur'));

      expect(onChangeSpy).toHaveBeenCalledWith('repair');
      expect(onTouchedSpy).toHaveBeenCalled();
    });

    it('should handle select with error state', () => {
      component.label = 'Vehicle';
      component.options = [
        { value: 'vehicle1', label: 'Vehicle 1' },
        { value: 'vehicle2', label: 'Vehicle 2', disabled: true },
      ];
      component.errorMessage = 'Vehicle selection required';
      fixture.detectChanges();

      expect(
        fixture.debugElement.query(By.css('label')).nativeElement.textContent,
      ).toContain('Vehicle');
      expect(
        fixture.debugElement.query(By.css('[role="alert"]')).nativeElement
          .textContent,
      ).toContain('Vehicle selection required');
    });
  });
});
