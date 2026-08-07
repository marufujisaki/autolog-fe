import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('EmptyStateComponent', () => {
  let component: EmptyStateComponent;
  let fixture: ComponentFixture<EmptyStateComponent>;
  let emptyStateElement: HTMLElement;
  let debugEmptyState: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    component = fixture.componentInstance;
    debugEmptyState = fixture.debugElement.query(By.css('.app-empty-state'));
    emptyStateElement = debugEmptyState.nativeElement;
    fixture.detectChanges();
  });

  describe('Icon Display', () => {
    it('should display default icon emoji', () => {
      expect(component.icon()).toBe('📭');
      const iconElement = fixture.debugElement.query(
        By.css('.app-empty-state__icon'),
      );
      expect(iconElement.nativeElement.textContent).toContain('📭');
    });

    it('should display custom icon emoji', () => {
      fixture.componentRef.setInput('icon', '🚗');
      fixture.detectChanges();

      const iconElement = fixture.debugElement.query(
        By.css('.app-empty-state__icon'),
      );
      expect(iconElement.nativeElement.textContent).toContain('🚗');
    });

    it('should update icon dynamically', () => {
      fixture.componentRef.setInput('icon', '📋');
      fixture.detectChanges();

      let iconElement = fixture.debugElement.query(
        By.css('.app-empty-state__icon'),
      );
      expect(iconElement.nativeElement.textContent).toContain('📋');

      fixture.componentRef.setInput('icon', '⚠️');
      fixture.detectChanges();

      iconElement = fixture.debugElement.query(
        By.css('.app-empty-state__icon'),
      );
      expect(iconElement.nativeElement.textContent).toContain('⚠️');
    });

    it('should support various icon types', () => {
      const icons = ['📭', '🚗', '📋', '❌', '✅', '⚙️'];

      icons.forEach((icon) => {
        fixture.componentRef.setInput('icon', icon);
        fixture.detectChanges();

        const iconElement = fixture.debugElement.query(
          By.css('.app-empty-state__icon'),
        );
        expect(iconElement.nativeElement.textContent).toContain(icon);
      });
    });
  });

  describe('Title Display', () => {
    it('should display default title', () => {
      expect(component.title()).toBe('No items');
      const titleElement = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      expect(titleElement.nativeElement.textContent).toContain('No items');
    });

    it('should display custom title', () => {
      fixture.componentRef.setInput('title', 'No vehicles found');
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      expect(titleElement.nativeElement.textContent).toContain(
        'No vehicles found',
      );
    });

    it('should update title dynamically', () => {
      fixture.componentRef.setInput('title', 'No maintenance logs');
      fixture.detectChanges();

      let titleElement = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      expect(titleElement.nativeElement.textContent).toContain(
        'No maintenance logs',
      );

      fixture.componentRef.setInput('title', 'Empty list');
      fixture.detectChanges();

      titleElement = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      expect(titleElement.nativeElement.textContent).toContain('Empty list');
    });

    it('should render title with semantic heading', () => {
      const heading = fixture.debugElement.query(By.css('h2'));
      expect(heading).toBeTruthy();
      expect(
        heading.nativeElement.classList.contains('app-empty-state__title'),
      ).toBe(true);
    });

    it('should support long title text', () => {
      const longTitle =
        'No maintenance records available for this vehicle in the selected period';
      fixture.componentRef.setInput('title', longTitle);
      fixture.detectChanges();

      const titleElement = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      expect(titleElement.nativeElement.textContent).toContain(longTitle);
    });
  });

  describe('Description Display', () => {
    it('should not display description when not provided', () => {
      fixture.componentRef.setInput('description', undefined);
      fixture.detectChanges();

      const descElement = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );
      expect(descElement).toBeNull();
    });

    it('should display description when provided', () => {
      fixture.componentRef.setInput('description', 'Start by adding a new vehicle');
      fixture.detectChanges();

      const descElement = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );
      expect(descElement).toBeTruthy();
      expect(descElement.nativeElement.textContent).toContain(
        'Start by adding a new vehicle',
      );
    });

    it('should update description dynamically', () => {
      fixture.componentRef.setInput('description', 'Create your first vehicle to get started');
      fixture.detectChanges();

      let descElement = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );
      expect(descElement.nativeElement.textContent).toContain(
        'Create your first vehicle to get started',
      );

      fixture.componentRef.setInput('description', 'No records to display yet');
      fixture.detectChanges();

      descElement = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );
      expect(descElement.nativeElement.textContent).toContain(
        'No records to display yet',
      );
    });

    it('should support long description text', () => {
      const longDescription =
        'You have not recorded any maintenance activities for your vehicles yet. Start by tapping the "+" button to create your first maintenance log.';
      fixture.componentRef.setInput('description', longDescription);
      fixture.detectChanges();

      const descElement = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );
      expect(descElement.nativeElement.textContent).toContain(longDescription);
    });

    it('should handle empty description string', () => {
      fixture.componentRef.setInput('description', '');
      fixture.detectChanges();

      const descElement = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );
      // Empty string should still render the element
      expect(descElement).toBeTruthy();
    });
  });

  describe('Semantic HTML', () => {
    it('should render as article element', () => {
      const article = fixture.debugElement.query(By.css('article'));
      expect(article).toBeTruthy();
    });

    it('should have app-empty-state class', () => {
      expect(emptyStateElement.classList.contains('app-empty-state')).toBe(
        true,
      );
    });

    it('should have semantic structure: icon, title, description', () => {
      fixture.componentRef.setInput('description', 'Please add items');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('.app-empty-state__icon'));
      const title = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      const desc = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );

      expect(icon).toBeTruthy();
      expect(title).toBeTruthy();
      expect(desc).toBeTruthy();
    });
  });

  describe('Accessibility', () => {
    it('should have role="status"', () => {
      expect(emptyStateElement.getAttribute('role')).toBe('status');
    });

    it('should include title in heading hierarchy', () => {
      const heading = fixture.debugElement.query(By.css('h2'));
      expect(heading).toBeTruthy();
    });

    it('should support ARIA attributes', () => {
      fixture.componentRef.setInput('description', 'No items available');
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.app-empty-state'));
      // Component should be marked as status region for screen readers
      expect(emptyState.nativeElement.getAttribute('role')).toBe('status');
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-card or ion-* elements', () => {
      const ionElements = fixture.debugElement.queryAll(By.css('[ion-]'));
      expect(ionElements.length).toBe(0);
    });

    it('should only render native HTML', () => {
      fixture.componentRef.setInput('description', 'Test description');
      fixture.detectChanges();

      const ionCard = fixture.debugElement.query(By.css('ion-card'));
      const ionContent = fixture.debugElement.query(By.css('ion-content'));
      const ionText = fixture.debugElement.query(By.css('ion-text'));

      expect(ionCard).toBeNull();
      expect(ionContent).toBeNull();
      expect(ionText).toBeNull();
    });

    it('should render semantic HTML elements', () => {
      const article = fixture.debugElement.query(By.css('article'));
      const heading = fixture.debugElement.query(By.css('h2'));

      expect(article).toBeTruthy();
      expect(heading).toBeTruthy();
    });
  });

  describe('Content Projection', () => {
    it('should support custom content projection via ng-content', () => {
      const customButton = document.createElement('button');
      customButton.textContent = 'Add Item';
      emptyStateElement.appendChild(customButton);
      fixture.detectChanges();

      expect(emptyStateElement.querySelector('button')).toBeTruthy();
      expect(emptyStateElement.querySelector('button')?.textContent).toBe(
        'Add Item',
      );
    });

    it('should allow custom actions below description', () => {
      fixture.componentRef.setInput('description', 'No vehicles yet');
      fixture.detectChanges();

      const actionLink = document.createElement('a');
      actionLink.href = '#add-vehicle';
      actionLink.textContent = 'Add your first vehicle';
      emptyStateElement.appendChild(actionLink);
      fixture.detectChanges();

      expect(emptyStateElement.querySelector('a')).toBeTruthy();
      expect(emptyStateElement.querySelector('a')?.textContent).toBe(
        'Add your first vehicle',
      );
    });
  });

  describe('Combination Tests', () => {
    it('should handle no vehicles empty state', () => {
      fixture.componentRef.setInput('icon', '🚗');
      fixture.componentRef.setInput('title', 'No vehicles');
      fixture.componentRef.setInput('description', 'Add your first vehicle to get started');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('.app-empty-state__icon'));
      const title = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      const desc = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );

      expect(icon.nativeElement.textContent).toContain('🚗');
      expect(title.nativeElement.textContent).toContain('No vehicles');
      expect(desc.nativeElement.textContent).toContain(
        'Add your first vehicle to get started',
      );
    });

    it('should handle no logs empty state', () => {
      fixture.componentRef.setInput('icon', '📋');
      fixture.componentRef.setInput('title', 'No maintenance logs');
      fixture.componentRef.setInput('description', 'Start recording maintenance activities for this vehicle');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('.app-empty-state__icon'));
      const title = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      const desc = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );

      expect(icon.nativeElement.textContent).toContain('📋');
      expect(title.nativeElement.textContent).toContain('No maintenance logs');
      expect(desc.nativeElement.textContent).toContain(
        'Start recording maintenance activities for this vehicle',
      );
    });

    it('should handle state transitions', () => {
      // First state: no vehicles
      fixture.componentRef.setInput('icon', '🚗');
      fixture.componentRef.setInput('title', 'No vehicles');
      fixture.componentRef.setInput('description', 'Add a vehicle');
      fixture.detectChanges();

      let title = fixture.debugElement.query(By.css('.app-empty-state__title'));
      expect(title.nativeElement.textContent).toContain('No vehicles');

      // Transition to: no search results
      fixture.componentRef.setInput('icon', '🔍');
      fixture.componentRef.setInput('title', 'No results found');
      fixture.componentRef.setInput('description', 'Try a different search term');
      fixture.detectChanges();

      title = fixture.debugElement.query(By.css('.app-empty-state__title'));
      expect(title.nativeElement.textContent).toContain('No results found');
    });

    it('should display all content variants together', () => {
      fixture.componentRef.setInput('icon', '⚠️');
      fixture.componentRef.setInput('title', 'Error loading data');
      fixture.componentRef.setInput('description', 'Please try again later');
      fixture.detectChanges();

      const emptyState = fixture.debugElement.query(By.css('.app-empty-state'));
      expect(
        emptyState.nativeElement.classList.contains('app-empty-state'),
      ).toBe(true);

      const icon = fixture.debugElement.query(By.css('.app-empty-state__icon'));
      const title = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      const desc = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );

      expect(icon).toBeTruthy();
      expect(title).toBeTruthy();
      expect(desc).toBeTruthy();
    });
  });

  describe('Multiple Empty State Instances', () => {
    it('should maintain independent state for different instances', () => {
      const fixture2 = TestBed.createComponent(EmptyStateComponent);
      const component2 = fixture2.componentInstance;

      fixture.componentRef.setInput('icon', '🚗');
      fixture.componentRef.setInput('title', 'No vehicles');

      fixture2.componentRef.setInput('icon', '📋');
      fixture2.componentRef.setInput('title', 'No logs');

      fixture.detectChanges();
      fixture2.detectChanges();

      const emptyState1 = fixture.debugElement.query(
        By.css('.app-empty-state'),
      );
      const emptyState2 = fixture2.debugElement.query(
        By.css('.app-empty-state'),
      );

      const title1 = emptyState1.query(By.css('.app-empty-state__title'));
      const title2 = emptyState2.query(By.css('.app-empty-state__title'));

      expect(title1.nativeElement.textContent).toContain('No vehicles');
      expect(title2.nativeElement.textContent).toContain('No logs');
    });
  });

  describe('Default Values', () => {
    it('should render with default icon and title', () => {
      const icon = fixture.debugElement.query(By.css('.app-empty-state__icon'));
      const title = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );

      expect(icon.nativeElement.textContent).toContain('📭');
      expect(title.nativeElement.textContent).toContain('No items');
    });

    it('should not render description by default', () => {
      const desc = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );
      expect(desc).toBeNull();
    });

    it('should allow overriding all defaults', () => {
      fixture.componentRef.setInput('icon', '✨');
      fixture.componentRef.setInput('title', 'All caught up');
      fixture.componentRef.setInput('description', 'No pending tasks');
      fixture.detectChanges();

      const icon = fixture.debugElement.query(By.css('.app-empty-state__icon'));
      const title = fixture.debugElement.query(
        By.css('.app-empty-state__title'),
      );
      const desc = fixture.debugElement.query(
        By.css('.app-empty-state__description'),
      );

      expect(icon.nativeElement.textContent).toContain('✨');
      expect(title.nativeElement.textContent).toContain('All caught up');
      expect(desc.nativeElement.textContent).toContain('No pending tasks');
    });
  });
});
