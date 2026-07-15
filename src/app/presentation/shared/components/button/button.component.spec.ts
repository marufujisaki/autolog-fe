import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ButtonComponent, ButtonVariant } from './button.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let nativeButton: HTMLButtonElement;
  let debugButton: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    debugButton = fixture.debugElement.query(By.css('button'));
    nativeButton = debugButton.nativeElement;
    fixture.detectChanges();
  });

  describe('Variant Rendering', () => {
    it('should render primary variant by default', () => {
      expect(component.variant).toBe('primary');
      expect(nativeButton.classList.contains('app-button--primary')).toBe(true);
    });

    it('should render secondary variant when specified', () => {
      component.variant = 'secondary';
      fixture.detectChanges();
      expect(nativeButton.classList.contains('app-button--secondary')).toBe(
        true,
      );
    });

    it('should render ghost variant when specified', () => {
      component.variant = 'ghost';
      fixture.detectChanges();
      expect(nativeButton.classList.contains('app-button--ghost')).toBe(true);
    });

    it('should render icon-button variant when specified', () => {
      component.variant = 'icon-button';
      fixture.detectChanges();
      expect(nativeButton.classList.contains('app-button--icon-button')).toBe(
        true,
      );
    });

    it('should change variant dynamically', () => {
      const variants: ButtonVariant[] = [
        'primary',
        'secondary',
        'ghost',
        'icon-button',
      ];
      variants.forEach((variant) => {
        component.variant = variant;
        fixture.detectChanges();
        expect(nativeButton.classList.contains(`app-button--${variant}`)).toBe(
          true,
        );
      });
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      expect(component.disabled).toBe(false);
      expect(nativeButton.disabled).toBe(false);
    });

    it('should apply disabled attribute when disabled is true', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(nativeButton.disabled).toBe(true);
      expect(nativeButton.classList.contains('app-button--disabled')).toBe(
        true,
      );
    });

    it('should prevent click events when disabled', () => {
      component.disabled = true;
      const clickSpy = jasmine.createSpy('clicked');
      component.clicked.subscribe(clickSpy);

      nativeButton.click();
      expect(clickSpy).not.toHaveBeenCalled();
    });

    it('should allow click events when enabled', () => {
      component.disabled = false;
      const clickSpy = jasmine.createSpy('clicked');
      component.clicked.subscribe(clickSpy);

      nativeButton.click();
      expect(clickSpy).toHaveBeenCalled();
    });
  });

  describe('Button Type', () => {
    it('should default to type "button"', () => {
      expect(component.type).toBe('button');
      expect(nativeButton.type).toBe('button');
    });

    it('should set type to "submit"', () => {
      component.type = 'submit';
      fixture.detectChanges();
      expect(nativeButton.type).toBe('submit');
    });

    it('should set type to "reset"', () => {
      component.type = 'reset';
      fixture.detectChanges();
      expect(nativeButton.type).toBe('reset');
    });
  });

  describe('Full Width', () => {
    it('should not be full width by default', () => {
      expect(component.fullWidth).toBe(false);
      expect(nativeButton.classList.contains('app-button--full-width')).toBe(
        false,
      );
    });

    it('should apply full-width class when fullWidth is true', () => {
      component.fullWidth = true;
      fixture.detectChanges();
      expect(nativeButton.classList.contains('app-button--full-width')).toBe(
        true,
      );
    });
  });

  describe('Accessibility - ariaLabel', () => {
    it('should not have aria-label by default', () => {
      expect(nativeButton.getAttribute('aria-label')).toBeNull();
    });

    it('should set aria-label when provided', () => {
      component.ariaLabel = 'Save changes';
      fixture.detectChanges();
      expect(nativeButton.getAttribute('aria-label')).toBe('Save changes');
    });

    it('should support aria-label for icon-button variant', () => {
      component.variant = 'icon-button';
      component.ariaLabel = 'Close menu';
      fixture.detectChanges();
      expect(nativeButton.getAttribute('aria-label')).toBe('Close menu');
    });
  });

  describe('Click Event Emission', () => {
    it('should emit clicked event on button click', () => {
      const clickSpy = jasmine.createSpy('clicked');
      component.clicked.subscribe(clickSpy);

      nativeButton.click();
      expect(clickSpy).toHaveBeenCalledTimes(1);
    });

    it('should emit the native click event', () => {
      const clickSpy = jasmine.createSpy('clicked');
      component.clicked.subscribe(clickSpy);

      const event = new MouseEvent('click');
      nativeButton.dispatchEvent(event);
      expect(clickSpy).toHaveBeenCalledWith(event);
    });

    it('should not emit click event when disabled', () => {
      const clickSpy = jasmine.createSpy('clicked');
      component.disabled = true;
      component.clicked.subscribe(clickSpy);
      fixture.detectChanges();

      nativeButton.click();
      expect(clickSpy).not.toHaveBeenCalled();
    });
  });

  describe('Content Projection', () => {
    it('should project text content', () => {
      fixture.componentInstance.variant = 'primary';
      nativeButton.textContent = 'Click me';
      fixture.detectChanges();
      expect(nativeButton.textContent.trim()).toBe('Click me');
    });

    it('should support icon markup projection', () => {
      const icon = document.createElement('i');
      icon.className = 'icon-check';
      nativeButton.appendChild(icon);
      fixture.detectChanges();
      expect(nativeButton.querySelector('.icon-check')).toBeTruthy();
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-button elements', () => {
      const ionButton = fixture.debugElement.query(By.css('ion-button'));
      expect(ionButton).toBeNull();
    });

    it('should only render native button element', () => {
      const nativeButtons = fixture.debugElement.queryAll(By.css('button'));
      const ionButtons = fixture.debugElement.queryAll(By.css('ion-button'));
      expect(nativeButtons.length).toBe(1);
      expect(ionButtons.length).toBe(0);
    });
  });

  describe('Combination Tests', () => {
    it('should handle multiple properties together', () => {
      component.variant = 'secondary';
      component.disabled = true;
      component.fullWidth = true;
      component.type = 'submit';
      component.ariaLabel = 'Submit form';
      fixture.detectChanges();

      expect(nativeButton.classList.contains('app-button--secondary')).toBe(
        true,
      );
      expect(nativeButton.disabled).toBe(true);
      expect(nativeButton.classList.contains('app-button--full-width')).toBe(
        true,
      );
      expect(nativeButton.type).toBe('submit');
      expect(nativeButton.getAttribute('aria-label')).toBe('Submit form');
    });

    it('should switch from disabled to enabled', () => {
      const clickSpy = jasmine.createSpy('clicked');
      component.clicked.subscribe(clickSpy);

      component.disabled = true;
      fixture.detectChanges();
      nativeButton.click();
      expect(clickSpy).not.toHaveBeenCalled();

      component.disabled = false;
      fixture.detectChanges();
      nativeButton.click();
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
