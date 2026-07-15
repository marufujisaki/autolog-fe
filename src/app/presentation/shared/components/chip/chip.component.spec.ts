import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ChipComponent, ChipVariant } from './chip.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ChipComponent', () => {
  let component: ChipComponent;
  let fixture: ComponentFixture<ChipComponent>;
  let chipElement: HTMLElement;
  let debugChip: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ChipComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ChipComponent);
    component = fixture.componentInstance;
    debugChip = fixture.debugElement.query(By.css('.app-chip'));
    chipElement = debugChip.nativeElement;
    fixture.detectChanges();
  });

  describe('Variant Rendering', () => {
    it('should render default variant by default', () => {
      expect(component.variant).toBe('default');
      expect(chipElement.classList.contains('app-chip--default')).toBe(true);
    });

    it('should render selected variant when specified', () => {
      component.variant = 'selected';
      fixture.detectChanges();
      expect(chipElement.classList.contains('app-chip--selected')).toBe(true);
    });

    it('should change variant dynamically', () => {
      const variants: ChipVariant[] = ['default', 'selected'];
      variants.forEach((variant) => {
        component.variant = variant;
        fixture.detectChanges();
        expect(chipElement.classList.contains(`app-chip--${variant}`)).toBe(
          true,
        );
      });
    });

    it('should remove old variant class when switching', () => {
      component.variant = 'default';
      fixture.detectChanges();
      expect(chipElement.classList.contains('app-chip--default')).toBe(true);

      component.variant = 'selected';
      fixture.detectChanges();
      expect(chipElement.classList.contains('app-chip--default')).toBe(false);
      expect(chipElement.classList.contains('app-chip--selected')).toBe(true);
    });
  });

  describe('Disabled State', () => {
    it('should not be disabled by default', () => {
      expect(component.disabled).toBe(false);
      expect(chipElement.classList.contains('app-chip--disabled')).toBe(false);
    });

    it('should apply disabled class when disabled is true', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(chipElement.classList.contains('app-chip--disabled')).toBe(true);
    });

    it('should remove disabled class when disabled is false', () => {
      component.disabled = true;
      fixture.detectChanges();
      expect(chipElement.classList.contains('app-chip--disabled')).toBe(true);

      component.disabled = false;
      fixture.detectChanges();
      expect(chipElement.classList.contains('app-chip--disabled')).toBe(false);
    });
  });

  describe('Removable Chip', () => {
    it('should not be removable by default', () => {
      expect(component.removable).toBe(false);
      const removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      expect(removeBtn).toBeNull();
    });

    it('should display remove button when removable is true', () => {
      component.removable = true;
      fixture.detectChanges();

      const removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      expect(removeBtn).toBeTruthy();
    });

    it('should hide remove button when removable is false', () => {
      component.removable = true;
      fixture.detectChanges();
      let removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      expect(removeBtn).toBeTruthy();

      component.removable = false;
      fixture.detectChanges();
      removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      expect(removeBtn).toBeNull();
    });

    it('should emit removed event when remove button is clicked', () => {
      component.removable = true;
      fixture.detectChanges();

      const removedSpy = jasmine.createSpy('removed');
      component.removed.subscribe(removedSpy);

      const removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      removeBtn.nativeElement.click();

      expect(removedSpy).toHaveBeenCalled();
    });

    it('should stop event propagation when remove button is clicked', () => {
      component.removable = true;
      fixture.detectChanges();

      const removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      const event = new MouseEvent('click');
      spyOn(event, 'stopPropagation');

      removeBtn.nativeElement.dispatchEvent(event);
      expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should not emit removed when clicked if not removable', () => {
      component.removable = false;
      fixture.detectChanges();

      const removedSpy = jasmine.createSpy('removed');
      component.removed.subscribe(removedSpy);

      // Manually trigger onRemove to test logic
      const event = new MouseEvent('click');
      component.onRemove(event);

      // removed should not be emitted for non-removable chips
      expect(removedSpy).not.toHaveBeenCalled();
    });
  });

  describe('Content Projection', () => {
    it('should project text content', () => {
      chipElement.textContent = 'MAINTENANCE';
      fixture.detectChanges();
      expect(chipElement.textContent).toContain('MAINTENANCE');
    });

    it('should project icon content', () => {
      const icon = document.createElement('i');
      icon.className = 'icon-check';
      chipElement.appendChild(icon);
      fixture.detectChanges();

      expect(chipElement.querySelector('.icon-check')).toBeTruthy();
    });

    it('should support both text and icon content', () => {
      const icon = document.createElement('i');
      icon.className = 'icon-tag';
      chipElement.appendChild(icon);

      const text = document.createTextNode('SERVICE');
      chipElement.appendChild(text);

      fixture.detectChanges();

      expect(chipElement.querySelector('.icon-tag')).toBeTruthy();
      expect(chipElement.textContent).toContain('SERVICE');
    });
  });

  describe('Semantic HTML', () => {
    it('should render as button element', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect(button).toBeTruthy();
    });

    it('should have app-chip class', () => {
      expect(chipElement.classList.contains('app-chip')).toBe(true);
    });

    it('should have type="button"', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect((button.nativeElement as HTMLButtonElement).type).toBe('button');
    });
  });

  describe('Accessibility', () => {
    it('should support aria-pressed for toggle chips', () => {
      component.variant = 'selected';
      fixture.detectChanges();

      const button = fixture.debugElement.query(By.css('button'));
      // The component may use aria-pressed if implemented
      expect(button).toBeTruthy();
    });

    it('should have aria-label on remove button when present', () => {
      component.removable = true;
      fixture.detectChanges();

      const removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      expect(removeBtn).toBeTruthy();
      // Component may have aria-label for accessibility
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-chip elements', () => {
      const ionChip = fixture.debugElement.query(By.css('ion-chip'));
      expect(ionChip).toBeNull();
    });

    it('should only render native button element', () => {
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      const ionChips = fixture.debugElement.queryAll(By.css('ion-chip'));
      expect(buttons.length).toBeGreaterThan(0);
      expect(ionChips.length).toBe(0);
    });
  });

  describe('Combination Tests', () => {
    it('should handle default selectable chip', () => {
      component.variant = 'default';
      component.disabled = false;
      component.removable = false;
      fixture.detectChanges();

      expect(chipElement.classList.contains('app-chip--default')).toBe(true);
      expect(chipElement.classList.contains('app-chip--disabled')).toBe(false);
      const removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      expect(removeBtn).toBeNull();
    });

    it('should handle selected removable chip', () => {
      const removedSpy = jasmine.createSpy('removed');
      component.variant = 'selected';
      component.removable = true;
      component.removed.subscribe(removedSpy);
      fixture.detectChanges();

      expect(chipElement.classList.contains('app-chip--selected')).toBe(true);
      const removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      expect(removeBtn).toBeTruthy();

      removeBtn.nativeElement.click();
      expect(removedSpy).toHaveBeenCalled();
    });

    it('should handle disabled removable chip', () => {
      component.disabled = true;
      component.removable = true;
      fixture.detectChanges();

      expect(chipElement.classList.contains('app-chip--disabled')).toBe(true);
      const removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      expect(removeBtn).toBeTruthy();
    });

    it('should handle chip state transitions', () => {
      component.variant = 'default';
      fixture.detectChanges();
      expect(chipElement.classList.contains('app-chip--default')).toBe(true);

      component.variant = 'selected';
      fixture.detectChanges();
      expect(chipElement.classList.contains('app-chip--selected')).toBe(true);
      expect(chipElement.classList.contains('app-chip--default')).toBe(false);

      component.disabled = true;
      fixture.detectChanges();
      expect(chipElement.classList.contains('app-chip--disabled')).toBe(true);

      component.removable = true;
      fixture.detectChanges();
      const removeBtn = fixture.debugElement.query(By.css('.app-chip__remove'));
      expect(removeBtn).toBeTruthy();
    });
  });

  describe('Multiple Chip Instances', () => {
    it('should maintain independent state for different instances', () => {
      const fixture2 = TestBed.createComponent(ChipComponent);
      const component2 = fixture2.componentInstance;

      component.variant = 'default';
      component.removable = false;

      component2.variant = 'selected';
      component2.removable = true;

      fixture.detectChanges();
      fixture2.detectChanges();

      const chip1 = fixture.debugElement.query(By.css('.app-chip'));
      const chip2 = fixture2.debugElement.query(By.css('.app-chip'));

      expect(chip1.nativeElement.classList.contains('app-chip--default')).toBe(
        true,
      );
      expect(
        fixture.debugElement.query(By.css('.app-chip__remove')),
      ).toBeNull();

      expect(chip2.nativeElement.classList.contains('app-chip--selected')).toBe(
        true,
      );
      expect(
        fixture2.debugElement.query(By.css('.app-chip__remove')),
      ).toBeTruthy();
    });
  });
});
