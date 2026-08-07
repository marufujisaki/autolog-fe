import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent, LoadingSize } from './loading.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('LoadingComponent', () => {
  let component: LoadingComponent;
  let fixture: ComponentFixture<LoadingComponent>;
  let loadingElement: HTMLElement;
  let debugLoading: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingComponent);
    component = fixture.componentInstance;
    debugLoading = fixture.debugElement.query(By.css('.app-loading'));
    loadingElement = debugLoading.nativeElement;
    fixture.detectChanges();
  });

  describe('Size Variants', () => {
    it('should default to size "md"', () => {
      expect(component.size()).toBe('md');
      expect(loadingElement.classList.contains('app-loading--md')).toBe(true);
    });

    it('should render size "sm"', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(loadingElement.classList.contains('app-loading--sm')).toBe(true);
    });

    it('should render size "lg"', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(loadingElement.classList.contains('app-loading--lg')).toBe(true);
    });

    it('should change size dynamically', () => {
      const sizes: LoadingSize[] = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();
        expect(loadingElement.classList.contains(`app-loading--${size}`)).toBe(
          true,
        );
      });
    });

    it('should remove old size class when switching', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.detectChanges();
      expect(loadingElement.classList.contains('app-loading--sm')).toBe(true);

      fixture.componentRef.setInput('size', 'lg');
      fixture.detectChanges();
      expect(loadingElement.classList.contains('app-loading--sm')).toBe(false);
      expect(loadingElement.classList.contains('app-loading--lg')).toBe(true);
    });
  });

  describe('Spinner Animation', () => {
    it('should render spinner element', () => {
      const spinner = fixture.debugElement.query(
        By.css('.app-loading__spinner'),
      );
      expect(spinner).toBeTruthy();
    });

    it('should have spinner class for all sizes', () => {
      const sizes: LoadingSize[] = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();

        const spinner = fixture.debugElement.query(
          By.css('.app-loading__spinner'),
        );
        expect(spinner).toBeTruthy();
        expect(
          spinner.nativeElement.classList.contains('app-loading__spinner'),
        ).toBe(true);
      });
    });
  });

  describe('Loading Text Display', () => {
    it('should not display text when not provided', () => {
      fixture.componentRef.setInput('text', undefined);
      fixture.detectChanges();

      const textElement = fixture.debugElement.query(
        By.css('.app-loading__text'),
      );
      expect(textElement).toBeNull();
    });

    it('should display text when provided', () => {
      fixture.componentRef.setInput('text', 'Loading...');
      fixture.detectChanges();

      const textElement = fixture.debugElement.query(
        By.css('.app-loading__text'),
      );
      expect(textElement).toBeTruthy();
      expect(textElement.nativeElement.textContent).toContain('Loading...');
    });

    it('should update text dynamically', () => {
      fixture.componentRef.setInput('text', 'Fetching data');
      fixture.detectChanges();

      let textElement = fixture.debugElement.query(
        By.css('.app-loading__text'),
      );
      expect(textElement.nativeElement.textContent).toContain('Fetching data');

      fixture.componentRef.setInput('text', 'Processing...');
      fixture.detectChanges();

      textElement = fixture.debugElement.query(By.css('.app-loading__text'));
      expect(textElement.nativeElement.textContent).toContain('Processing...');
    });

    it('should handle empty text string', () => {
      fixture.componentRef.setInput('text', '');
      fixture.detectChanges();

      const textElement = fixture.debugElement.query(
        By.css('.app-loading__text'),
      );
      // Empty string should still render the element
      expect(textElement).toBeTruthy();
    });

    it('should support text with different content', () => {
      const textVariants = [
        'Please wait...',
        'Uploading files',
        'Saving changes',
        'Synchronizing',
      ];

      textVariants.forEach((text) => {
        fixture.componentRef.setInput('text', text);
        fixture.detectChanges();

        const textElement = fixture.debugElement.query(
          By.css('.app-loading__text'),
        );
        expect(textElement.nativeElement.textContent).toContain(text);
      });
    });
  });

  describe('Accessibility - ariaLabel', () => {
    it('should default to "Loading" aria-label', () => {
      expect(component.ariaLabel()).toBe('Loading');
      expect(loadingElement.getAttribute('aria-label')).toBe('Loading');
    });

    it('should set custom aria-label when provided', () => {
      fixture.componentRef.setInput('ariaLabel', 'Uploading file...');
      fixture.detectChanges();
      expect(loadingElement.getAttribute('aria-label')).toBe(
        'Uploading file...',
      );
    });

    it('should have role="status"', () => {
      expect(loadingElement.getAttribute('role')).toBe('status');
    });

    it('should have aria-live="polite"', () => {
      expect(loadingElement.getAttribute('aria-live')).toBe('polite');
    });

    it('should have aria-busy="true"', () => {
      expect(loadingElement.getAttribute('aria-busy')).toBe('true');
    });

    it('should support descriptive aria-labels', () => {
      const ariaLabels = [
        'Loading vehicle data',
        'Processing maintenance logs',
        'Uploading photos',
        'Saving changes to server',
      ];

      ariaLabels.forEach((label) => {
        fixture.componentRef.setInput('ariaLabel', label);
        fixture.detectChanges();
        expect(loadingElement.getAttribute('aria-label')).toBe(label);
      });
    });
  });

  describe('Semantic HTML', () => {
    it('should render as div element', () => {
      const div = fixture.debugElement.query(By.css('div.app-loading'));
      expect(div).toBeTruthy();
    });

    it('should have app-loading class', () => {
      expect(loadingElement.classList.contains('app-loading')).toBe(true);
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-spinner elements', () => {
      const ionSpinner = fixture.debugElement.query(By.css('ion-spinner'));
      expect(ionSpinner).toBeNull();
    });

    it('should not render any ion-loading elements', () => {
      const ionLoading = fixture.debugElement.query(By.css('ion-loading'));
      expect(ionLoading).toBeNull();
    });

    it('should only render native HTML', () => {
      const ionElements = fixture.debugElement.queryAll(By.css('[ion-]'));
      expect(ionElements.length).toBe(0);
    });
  });

  describe('Content Structure', () => {
    it('should have proper structure: loading > spinner + text', () => {
      fixture.componentRef.setInput('text', 'Loading...');
      fixture.componentRef.setInput('size', 'md');
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(
        By.css('.app-loading__spinner'),
      );
      const text = fixture.debugElement.query(By.css('.app-loading__text'));

      expect(spinner).toBeTruthy();
      expect(text).toBeTruthy();
    });

    it('should render spinner without text', () => {
      fixture.componentRef.setInput('text', undefined);
      fixture.detectChanges();

      const spinner = fixture.debugElement.query(
        By.css('.app-loading__spinner'),
      );
      const text = fixture.debugElement.query(By.css('.app-loading__text'));

      expect(spinner).toBeTruthy();
      expect(text).toBeNull();
    });
  });

  describe('Combination Tests', () => {
    it('should handle small spinner with text', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.componentRef.setInput('text', 'Loading...');
      fixture.componentRef.setInput('ariaLabel', 'Loading small');
      fixture.detectChanges();

      expect(loadingElement.classList.contains('app-loading--sm')).toBe(true);
      const text = fixture.debugElement.query(By.css('.app-loading__text'));
      expect(text.nativeElement.textContent).toContain('Loading...');
      expect(loadingElement.getAttribute('aria-label')).toBe('Loading small');
    });

    it('should handle large spinner with descriptive text', () => {
      fixture.componentRef.setInput('size', 'lg');
      fixture.componentRef.setInput('text', 'Processing your request...');
      fixture.componentRef.setInput('ariaLabel', 'Processing data');
      fixture.detectChanges();

      expect(loadingElement.classList.contains('app-loading--lg')).toBe(true);
      const text = fixture.debugElement.query(By.css('.app-loading__text'));
      expect(text.nativeElement.textContent).toContain(
        'Processing your request...',
      );
      expect(loadingElement.getAttribute('aria-label')).toBe('Processing data');
    });

    it('should handle state transitions', () => {
      fixture.componentRef.setInput('size', 'sm');
      fixture.componentRef.setInput('text', 'Starting...');
      fixture.detectChanges();

      expect(loadingElement.classList.contains('app-loading--sm')).toBe(true);
      let text = fixture.debugElement.query(By.css('.app-loading__text'));
      expect(text.nativeElement.textContent).toContain('Starting...');

      fixture.componentRef.setInput('size', 'lg');
      fixture.componentRef.setInput('text', 'In progress...');
      fixture.detectChanges();

      expect(loadingElement.classList.contains('app-loading--lg')).toBe(true);
      text = fixture.debugElement.query(By.css('.app-loading__text'));
      expect(text.nativeElement.textContent).toContain('In progress...');
    });

    it('should support all size/text combinations', () => {
      const sizes: LoadingSize[] = ['sm', 'md', 'lg'];
      const texts = ['Loading...', 'Please wait', 'Processing'];

      sizes.forEach((size) => {
        texts.forEach((text) => {
          fixture.componentRef.setInput('size', size);
          fixture.componentRef.setInput('text', text);
          fixture.detectChanges();

          expect(
            loadingElement.classList.contains(`app-loading--${size}`),
          ).toBe(true);
          const textElement = fixture.debugElement.query(
            By.css('.app-loading__text'),
          );
          expect(textElement.nativeElement.textContent).toContain(text);
        });
      });
    });
  });

  describe('Multiple Loading Instances', () => {
    it('should maintain independent state for different instances', () => {
      const fixture2 = TestBed.createComponent(LoadingComponent);
      const component2 = fixture2.componentInstance;

      fixture.componentRef.setInput('size', 'sm');
      fixture.componentRef.setInput('text', 'Loading 1');

      fixture2.componentRef.setInput('size', 'lg');
      fixture2.componentRef.setInput('text', 'Loading 2');

      fixture.detectChanges();
      fixture2.detectChanges();

      const loading1 = fixture.debugElement.query(By.css('.app-loading'));
      const loading2 = fixture2.debugElement.query(By.css('.app-loading'));

      expect(loading1.nativeElement.classList.contains('app-loading--sm')).toBe(
        true,
      );
      expect(loading2.nativeElement.classList.contains('app-loading--lg')).toBe(
        true,
      );
    });
  });

  describe('Styling Integration', () => {
    it('should use design token-based class naming', () => {
      fixture.componentRef.setInput('size', 'md');
      fixture.detectChanges();

      // Verify class names follow design token naming convention
      expect(loadingElement.className).toMatch(/^app-loading/);
      expect(loadingElement.className).toContain('app-loading--md');
    });

    it('should maintain spinner class across size changes', () => {
      const sizes: LoadingSize[] = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        fixture.componentRef.setInput('size', size);
        fixture.detectChanges();

        const spinner = fixture.debugElement.query(
          By.css('.app-loading__spinner'),
        );
        expect(spinner.nativeElement.className).toContain(
          'app-loading__spinner',
        );
      });
    });
  });
});
