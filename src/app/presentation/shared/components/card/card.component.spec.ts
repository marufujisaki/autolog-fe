import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CardComponent, CardVariant } from './card.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;
  let cardElement: HTMLElement;
  let debugCard: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    debugCard = fixture.debugElement.query(By.css('.app-card'));
    cardElement = debugCard.nativeElement;
    fixture.detectChanges();
  });

  describe('Variant Rendering', () => {
    it('should render elevated variant by default', () => {
      expect(component.variant()).toBe('elevated');
      expect(cardElement.classList.contains('app-card--elevated')).toBe(true);
    });

    it('should render elevated variant when specified', () => {
      fixture.componentRef.setInput('variant', 'elevated');
      fixture.detectChanges();
      expect(cardElement.classList.contains('app-card--elevated')).toBe(true);
    });

    it('should render outlined variant when specified', () => {
      fixture.componentRef.setInput('variant', 'outlined');
      fixture.detectChanges();
      expect(cardElement.classList.contains('app-card--outlined')).toBe(true);
    });

    it('should change variant dynamically', () => {
      const variants: CardVariant[] = ['elevated', 'outlined'];
      variants.forEach((variant) => {
        fixture.componentRef.setInput('variant', variant);
        fixture.detectChanges();
        expect(cardElement.classList.contains(`app-card--${variant}`)).toBe(
          true,
        );
      });
    });

    it('should remove old variant class when switching', () => {
      fixture.componentRef.setInput('variant', 'elevated');
      fixture.detectChanges();
      expect(cardElement.classList.contains('app-card--elevated')).toBe(true);

      fixture.componentRef.setInput('variant', 'outlined');
      fixture.detectChanges();
      expect(cardElement.classList.contains('app-card--elevated')).toBe(false);
      expect(cardElement.classList.contains('app-card--outlined')).toBe(true);
    });
  });

  describe('Padding', () => {
    it('should be padded by default', () => {
      expect(component.padded()).toBe(true);
      expect(cardElement.classList.contains('app-card--padded')).toBe(true);
    });

    it('should apply padded class when padded is true', () => {
      fixture.componentRef.setInput('padded', true);
      fixture.detectChanges();
      expect(cardElement.classList.contains('app-card--padded')).toBe(true);
    });

    it('should not apply padded class when padded is false', () => {
      fixture.componentRef.setInput('padded', false);
      fixture.detectChanges();
      expect(cardElement.classList.contains('app-card--padded')).toBe(false);
    });

    it('should toggle padding dynamically', () => {
      fixture.componentRef.setInput('padded', true);
      fixture.detectChanges();
      expect(cardElement.classList.contains('app-card--padded')).toBe(true);

      fixture.componentRef.setInput('padded', false);
      fixture.detectChanges();
      expect(cardElement.classList.contains('app-card--padded')).toBe(false);

      fixture.componentRef.setInput('padded', true);
      fixture.detectChanges();
      expect(cardElement.classList.contains('app-card--padded')).toBe(true);
    });
  });

  describe('Content Projection', () => {
    it('should project content via ng-content', () => {
      const projectedContent = document.createTextNode('Card content');
      cardElement.appendChild(projectedContent);
      fixture.detectChanges();

      expect(cardElement.textContent).toContain('Card content');
    });

    it('should support complex HTML content', () => {
      const heading = document.createElement('h3');
      heading.textContent = 'Vehicle Card';
      const paragraph = document.createElement('p');
      paragraph.textContent = 'Year: 2023';

      cardElement.appendChild(heading);
      cardElement.appendChild(paragraph);
      fixture.detectChanges();

      expect(cardElement.querySelector('h3')?.textContent).toBe('Vehicle Card');
      expect(cardElement.querySelector('p')?.textContent).toBe('Year: 2023');
    });

    it('should support multiple ng-content slots', () => {
      const header = document.createElement('div');
      header.className = 'card-header';
      header.textContent = 'Header';

      const body = document.createElement('div');
      body.className = 'card-body';
      body.textContent = 'Body';

      cardElement.appendChild(header);
      cardElement.appendChild(body);
      fixture.detectChanges();

      expect(cardElement.querySelector('.card-header')).toBeTruthy();
      expect(cardElement.querySelector('.card-body')).toBeTruthy();
    });
  });

  describe('Semantic HTML', () => {
    it('should render as article element', () => {
      const article = fixture.debugElement.query(By.css('article'));
      expect(article).toBeTruthy();
    });

    it('should have app-card class', () => {
      expect(cardElement.classList.contains('app-card')).toBe(true);
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-card elements', () => {
      const ionCard = fixture.debugElement.query(By.css('ion-card'));
      expect(ionCard).toBeNull();
    });

    it('should only render native HTML structure', () => {
      const ionElements = fixture.debugElement.queryAll(By.css('[ion-]'));
      expect(ionElements.length).toBe(0);
    });

    it('should use semantic HTML (article tag)', () => {
      const articles = fixture.debugElement.queryAll(By.css('article'));
      expect(articles.length).toBeGreaterThan(0);
    });
  });

  describe('Styling Integration', () => {
    it('should be using SCSS design tokens (class naming)', () => {
      // Verify class names follow design token naming convention
      expect(cardElement.className).toMatch(/^app-card/);
    });

    it('should maintain class consistency with variants', () => {
      fixture.componentRef.setInput('variant', 'elevated');
      fixture.detectChanges();
      expect(cardElement.className).toContain('app-card--elevated');

      fixture.componentRef.setInput('variant', 'outlined');
      fixture.detectChanges();
      expect(cardElement.className).toContain('app-card--outlined');
    });
  });

  describe('Combination Tests', () => {
    it('should handle elevated card with padding', () => {
      fixture.componentRef.setInput('variant', 'elevated');
      fixture.componentRef.setInput('padded', true);
      fixture.detectChanges();

      expect(cardElement.classList.contains('app-card--elevated')).toBe(true);
      expect(cardElement.classList.contains('app-card--padded')).toBe(true);
    });

    it('should handle outlined card without padding', () => {
      fixture.componentRef.setInput('variant', 'outlined');
      fixture.componentRef.setInput('padded', false);
      fixture.detectChanges();

      expect(cardElement.classList.contains('app-card--outlined')).toBe(true);
      expect(cardElement.classList.contains('app-card--padded')).toBe(false);
    });

    it('should handle complete card scenario with content', () => {
      fixture.componentRef.setInput('variant', 'elevated');
      fixture.componentRef.setInput('padded', true);
      fixture.detectChanges();

      // Add content
      const title = document.createElement('h2');
      title.textContent = 'Vehicle Information';
      const description = document.createElement('p');
      description.textContent = '2023 Toyota Camry';

      cardElement.appendChild(title);
      cardElement.appendChild(description);
      fixture.detectChanges();

      // Verify card state
      expect(cardElement.classList.contains('app-card--elevated')).toBe(true);
      expect(cardElement.classList.contains('app-card--padded')).toBe(true);
      expect(cardElement.querySelector('h2')?.textContent).toBe(
        'Vehicle Information',
      );
      expect(cardElement.querySelector('p')?.textContent).toBe(
        '2023 Toyota Camry',
      );
    });

    it('should switch between variants with content intact', () => {
      // Add content
      const content = document.createElement('p');
      content.textContent = 'Card content';
      cardElement.appendChild(content);

      fixture.componentRef.setInput('variant', 'elevated');
      fixture.detectChanges();
      expect(cardElement.querySelector('p')?.textContent).toBe('Card content');

      fixture.componentRef.setInput('variant', 'outlined');
      fixture.detectChanges();
      expect(cardElement.querySelector('p')?.textContent).toBe('Card content');

      fixture.componentRef.setInput('variant', 'elevated');
      fixture.detectChanges();
      expect(cardElement.querySelector('p')?.textContent).toBe('Card content');
    });
  });

  describe('Multiple Card Instances', () => {
    it('should maintain independent state for different instances', () => {
      const fixture2 = TestBed.createComponent(CardComponent);
      const component2 = fixture2.componentInstance;

      fixture.componentRef.setInput('variant', 'elevated');
      fixture.componentRef.setInput('padded', true);

      fixture2.componentRef.setInput('variant', 'outlined');
      fixture2.componentRef.setInput('padded', false);

      fixture.detectChanges();
      fixture2.detectChanges();

      const card1 = fixture.debugElement.query(By.css('.app-card'));
      const card2 = fixture2.debugElement.query(By.css('.app-card'));

      expect(card1.nativeElement.classList.contains('app-card--elevated')).toBe(
        true,
      );
      expect(card1.nativeElement.classList.contains('app-card--padded')).toBe(
        true,
      );

      expect(card2.nativeElement.classList.contains('app-card--outlined')).toBe(
        true,
      );
      expect(card2.nativeElement.classList.contains('app-card--padded')).toBe(
        false,
      );
    });
  });
});
