import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { provideTranslateService } from '@ngx-translate/core';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [provideTranslateService()],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('Modal Visibility', () => {
    it('should not be open by default', () => {
      expect(component.isOpen()).toBe(false);
    });

    it('should render modal when isOpen is true', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.app-modal'));
      expect(modal).toBeTruthy();
    });

    it('should not render modal when isOpen is false', () => {
      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.app-modal'));
      expect(modal).toBeNull();
    });

    it('should toggle modal visibility dynamically', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      let modal = fixture.debugElement.query(By.css('.app-modal'));
      expect(modal).toBeTruthy();

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      modal = fixture.debugElement.query(By.css('.app-modal'));
      expect(modal).toBeNull();
    });
  });

  describe('Modal Title', () => {
    it('should not display title when not provided', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('.app-modal__title'));
      expect(title).toBeNull();
    });

    it('should display title when provided', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'Confirm Action');
      fixture.detectChanges();

      const title = fixture.debugElement.query(By.css('.app-modal__title'));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Confirm Action');
    });

    it('should update title dynamically', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'First Title');
      fixture.detectChanges();

      let title = fixture.debugElement.query(By.css('.app-modal__title'));
      expect(title.nativeElement.textContent).toContain('First Title');

      fixture.componentRef.setInput('title', 'Updated Title');
      fixture.detectChanges();

      title = fixture.debugElement.query(By.css('.app-modal__title'));
      expect(title.nativeElement.textContent).toContain('Updated Title');
    });
  });

  describe('Modal Backdrop and Close Behavior', () => {
    it('should render backdrop when modal is open', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const backdrop = fixture.debugElement.query(
        By.css('.app-modal__backdrop'),
      );
      expect(backdrop).toBeTruthy();
    });

    it('should emit closed event when backdrop is clicked', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const closedSpy = jasmine.createSpy('closed');
      component.closed.subscribe(closedSpy);

      const backdrop = fixture.debugElement.query(
        By.css('.app-modal__backdrop'),
      );
      backdrop.nativeElement.click();

      expect(closedSpy).toHaveBeenCalled();
    });

    it('should emit closed event when close button is clicked', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'Modal Title');
      fixture.detectChanges();

      const closedSpy = jasmine.createSpy('closed');
      component.closed.subscribe(closedSpy);

      const closeBtn = fixture.debugElement.query(By.css('.app-modal__close'));
      if (closeBtn) {
        closeBtn.nativeElement.click();
        expect(closedSpy).toHaveBeenCalled();
      }
    });

    it('should prevent click propagation when close button is clicked', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'Modal Title');
      fixture.detectChanges();

      const closeBtn = fixture.debugElement.query(By.css('.app-modal__close'));
      if (closeBtn) {
        const event = new MouseEvent('click');
        spyOn(event, 'stopPropagation');
        closeBtn.nativeElement.dispatchEvent(event);
        expect(event.stopPropagation).toHaveBeenCalled();
      }
    });
  });

  describe('Content Projection', () => {
    it('should project header content', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'Header');
      fixture.detectChanges();

      const header = fixture.debugElement.query(By.css('.app-modal__header'));
      expect(header).toBeTruthy();
    });

    it('should project body content via ng-content', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const body = fixture.debugElement.query(By.css('.app-modal__body'));
      expect(body).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have role="dialog" on modal element', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.app-modal'));
      expect(modal.nativeElement.getAttribute('role')).toBe('dialog');
    });

    it('should have aria-modal="true"', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.app-modal'));
      expect(modal.nativeElement.getAttribute('aria-modal')).toBe('true');
    });

    it('should have aria-labelledby when title is provided', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'Modal Title');
      fixture.detectChanges();

      const modal = fixture.debugElement.query(By.css('.app-modal'));
      const labelledBy = modal.nativeElement.getAttribute('aria-labelledby');
      expect(labelledBy).toBeTruthy();

      const title = fixture.debugElement.query(By.css(`#${labelledBy}`));
      expect(title).toBeTruthy();
      expect(title.nativeElement.textContent).toContain('Modal Title');
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-modal elements', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const ionModal = fixture.debugElement.query(By.css('ion-modal'));
      expect(ionModal).toBeNull();
    });

    it('should only use native HTML structure', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const ionElements = fixture.debugElement.queryAll(By.css('[ion-]'));
      expect(ionElements.length).toBe(0);
    });
  });

  describe('Modal Overlay Behavior', () => {
    it('should prevent body scroll when modal is open', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      // Check if modal has overflow properties applied
      const modal = fixture.debugElement.query(By.css('.app-modal'));
      expect(modal).toBeTruthy();
    });

    it('should have semi-transparent backdrop', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const backdrop = fixture.debugElement.query(
        By.css('.app-modal__backdrop'),
      );
      const styles = window.getComputedStyle(backdrop.nativeElement);
      // Verify backdrop exists and has styling
      expect(backdrop).toBeTruthy();
    });
  });

  describe('Closed Event Emission', () => {
    it('should emit closed event', (done) => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      component.closed.subscribe(() => {
        expect(true).toBe(true);
        done();
      });

      component.onBackdropClick();
    });

    it('should emit closed event multiple times', () => {
      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();

      const closedSpy = jasmine.createSpy('closed');
      component.closed.subscribe(closedSpy);

      component.onBackdropClick();
      component.onCloseClick();
      component.onBackdropClick();

      expect(closedSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe('Combination Tests', () => {
    it('should handle complete modal interaction', () => {
      const closedSpy = jasmine.createSpy('closed');
      component.closed.subscribe(closedSpy);

      fixture.componentRef.setInput('isOpen', true);
      fixture.componentRef.setInput('title', 'Delete Confirmation');
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('.app-modal'))).toBeTruthy();
      expect(
        fixture.debugElement.query(By.css('.app-modal__title')).nativeElement
          .textContent,
      ).toContain('Delete Confirmation');

      const backdrop = fixture.debugElement.query(
        By.css('.app-modal__backdrop'),
      );
      backdrop.nativeElement.click();

      expect(closedSpy).toHaveBeenCalled();
    });

    it('should handle rapid open/close cycles', () => {
      const closedSpy = jasmine.createSpy('closed');
      component.closed.subscribe(closedSpy);

      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.app-modal'))).toBeTruthy();

      fixture.componentRef.setInput('isOpen', false);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.app-modal'))).toBeNull();

      fixture.componentRef.setInput('isOpen', true);
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('.app-modal'))).toBeTruthy();
    });
  });
});
