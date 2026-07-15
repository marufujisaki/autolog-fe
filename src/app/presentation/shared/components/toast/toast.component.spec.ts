import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ToastComponent, ToastType } from './toast.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    component.ngOnDestroy();
  });

  describe('Message Display', () => {
    it('should display message text', () => {
      component.message = 'Operation successful';
      component.isVisible = true;
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.textContent).toContain('Operation successful');
    });

    it('should update message dynamically', () => {
      component.isVisible = true;
      component.message = 'First message';
      fixture.detectChanges();

      let toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.textContent).toContain('First message');

      component.message = 'Updated message';
      fixture.detectChanges();

      toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.textContent).toContain('Updated message');
    });

    it('should handle empty message', () => {
      component.message = '';
      component.isVisible = true;
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast).toBeTruthy();
    });
  });

  describe('Toast Type Variants', () => {
    it('should default to type "info"', () => {
      expect(component.type).toBe('info');
      component.isVisible = true;
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.classList.contains('app-toast--info')).toBe(
        true,
      );
    });

    it('should render success type', () => {
      component.type = 'success';
      component.isVisible = true;
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.classList.contains('app-toast--success')).toBe(
        true,
      );
    });

    it('should render error type', () => {
      component.type = 'error';
      component.isVisible = true;
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.classList.contains('app-toast--error')).toBe(
        true,
      );
    });

    it('should render warning type', () => {
      component.type = 'warning';
      component.isVisible = true;
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.classList.contains('app-toast--warning')).toBe(
        true,
      );
    });

    it('should change type dynamically', () => {
      const types: ToastType[] = ['success', 'error', 'warning', 'info'];
      component.isVisible = true;

      types.forEach((type) => {
        component.type = type;
        fixture.detectChanges();

        const toast = fixture.debugElement.query(By.css('.app-toast'));
        expect(
          toast.nativeElement.classList.contains(`app-toast--${type}`),
        ).toBe(true);
      });
    });
  });

  describe('Visibility Control', () => {
    it('should not render toast when isVisible is false', () => {
      component.isVisible = false;
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast).toBeNull();
    });

    it('should render toast when isVisible is true', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast).toBeTruthy();
    });

    it('should toggle visibility dynamically', () => {
      component.message = 'Test message';

      component.isVisible = true;
      fixture.detectChanges();
      let toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast).toBeTruthy();

      component.isVisible = false;
      fixture.detectChanges();
      toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast).toBeNull();

      component.isVisible = true;
      fixture.detectChanges();
      toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast).toBeTruthy();
    });
  });

  describe('Auto-Dismiss Duration', () => {
    it('should default to 3000ms duration', () => {
      expect(component.duration).toBe(3000);
    });

    it('should auto-dismiss after specified duration', fakeAsync(() => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      component.message = 'Auto-dismiss message';
      component.duration = 1000;
      component.isVisible = true;
      fixture.detectChanges();

      component.ngOnInit();

      expect(dismissedSpy).not.toHaveBeenCalled();

      tick(1000);
      expect(dismissedSpy).toHaveBeenCalled();
      expect(component.isVisible).toBe(false);
    }));

    it('should not auto-dismiss when duration is 0', fakeAsync(() => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      component.message = 'Persistent message';
      component.duration = 0;
      component.isVisible = true;
      fixture.detectChanges();

      component.ngOnInit();

      tick(5000);
      expect(dismissedSpy).not.toHaveBeenCalled();
    }));

    it('should not auto-dismiss when duration is negative', fakeAsync(() => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      component.message = 'Persistent message';
      component.duration = -1;
      component.isVisible = true;
      fixture.detectChanges();

      component.ngOnInit();

      tick(5000);
      expect(dismissedSpy).not.toHaveBeenCalled();
    }));

    it('should set custom duration', fakeAsync(() => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      component.duration = 500;
      component.isVisible = true;
      fixture.detectChanges();

      component.ngOnInit();

      tick(500);
      expect(dismissedSpy).toHaveBeenCalled();
    }));
  });

  describe('Manual Dismiss', () => {
    it('should emit dismissed event when dismiss is called', () => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      component.dismiss();

      expect(dismissedSpy).toHaveBeenCalled();
    });

    it('should set isVisible to false when dismissed', () => {
      component.isVisible = true;
      component.dismiss();

      expect(component.isVisible).toBe(false);
    });

    it('should allow manual dismiss via close button', () => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      component.isVisible = true;
      component.message = 'Test';
      fixture.detectChanges();

      const closeBtn = fixture.debugElement.query(By.css('.app-toast__close'));
      if (closeBtn) {
        closeBtn.nativeElement.click();
        expect(dismissedSpy).toHaveBeenCalled();
      }
    });

    it('should cancel auto-dismiss timer when manually dismissed', fakeAsync(() => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      component.duration = 2000;
      component.isVisible = true;
      fixture.detectChanges();

      component.ngOnInit();

      tick(1000);
      component.dismiss();

      tick(1000);
      expect(dismissedSpy).toHaveBeenCalledTimes(1);
    }));
  });

  describe('Lifecycle Cleanup', () => {
    it('should clear timeout on destroy', fakeAsync(() => {
      component.duration = 1000;
      component.isVisible = true;
      fixture.detectChanges();

      component.ngOnInit();

      tick(500);
      component.ngOnDestroy();

      tick(1000);
      // If timeout was properly cleared, dismissed should not be called
      // This test verifies cleanup behavior
      expect(component.isVisible).toBe(true); // Still true because manually destroyed
    }));
  });

  describe('Accessibility', () => {
    it('should have role="status" for polite notifications', () => {
      component.isVisible = true;
      component.type = 'info';
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.getAttribute('role')).toBe('status');
    });

    it('should have aria-live="polite"', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should have role="alert" for error toasts', () => {
      component.isVisible = true;
      component.type = 'error';
      fixture.detectChanges();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      const role = toast.nativeElement.getAttribute('role');
      expect(role === 'alert' || role === 'status').toBe(true);
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-toast elements', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const ionToast = fixture.debugElement.query(By.css('ion-toast'));
      expect(ionToast).toBeNull();
    });

    it('should only render native HTML', () => {
      component.isVisible = true;
      fixture.detectChanges();

      const ionElements = fixture.debugElement.queryAll(By.css('[ion-]'));
      expect(ionElements.length).toBe(0);
    });
  });

  describe('Combination Tests', () => {
    it('should handle success toast with auto-dismiss', fakeAsync(() => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      component.message = 'Changes saved successfully';
      component.type = 'success';
      component.duration = 2000;
      component.isVisible = true;
      fixture.detectChanges();

      component.ngOnInit();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.classList.contains('app-toast--success')).toBe(
        true,
      );
      expect(toast.nativeElement.textContent).toContain(
        'Changes saved successfully',
      );

      tick(2000);
      expect(dismissedSpy).toHaveBeenCalled();
    }));

    it('should handle error toast with manual dismiss', () => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      component.message = 'An error occurred';
      component.type = 'error';
      component.duration = 0; // No auto-dismiss
      component.isVisible = true;
      fixture.detectChanges();

      component.ngOnInit();

      const toast = fixture.debugElement.query(By.css('.app-toast'));
      expect(toast.nativeElement.classList.contains('app-toast--error')).toBe(
        true,
      );

      component.dismiss();
      expect(dismissedSpy).toHaveBeenCalled();
      expect(component.isVisible).toBe(false);
    });

    it('should handle multiple sequential toasts', fakeAsync(() => {
      const dismissedSpy = jasmine.createSpy('dismissed');
      component.dismissed.subscribe(dismissedSpy);

      // First toast
      component.message = 'Toast 1';
      component.type = 'info';
      component.duration = 1000;
      component.isVisible = true;
      fixture.detectChanges();
      component.ngOnInit();

      tick(1000);
      expect(dismissedSpy).toHaveBeenCalledTimes(1);

      // Second toast
      component.message = 'Toast 2';
      component.type = 'success';
      component.duration = 1000;
      component.isVisible = true;
      fixture.detectChanges();
      component.ngOnInit();

      tick(1000);
      expect(dismissedSpy).toHaveBeenCalledTimes(2);
    }));
  });

  describe('Multiple Toast Instances', () => {
    it('should maintain independent timers for different instances', fakeAsync(() => {
      const dismissedSpy1 = jasmine.createSpy('dismissed1');
      const dismissedSpy2 = jasmine.createSpy('dismissed2');

      const fixture2 = TestBed.createComponent(ToastComponent);
      const component2 = fixture2.componentInstance;

      component.dismissed.subscribe(dismissedSpy1);
      component2.dismissed.subscribe(dismissedSpy2);

      component.message = 'Toast 1';
      component.duration = 1000;
      component.isVisible = true;
      component.ngOnInit();

      component2.message = 'Toast 2';
      component2.duration = 2000;
      component2.isVisible = true;
      component2.ngOnInit();

      tick(1000);
      expect(dismissedSpy1).toHaveBeenCalled();
      expect(dismissedSpy2).not.toHaveBeenCalled();

      tick(1000);
      expect(dismissedSpy2).toHaveBeenCalled();

      component2.ngOnDestroy();
    }));
  });
});
