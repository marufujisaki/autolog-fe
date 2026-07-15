import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent, AvatarSize } from './avatar.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;
  let avatarElement: HTMLElement;
  let debugAvatar: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    debugAvatar = fixture.debugElement.query(By.css('.app-avatar'));
    avatarElement = debugAvatar.nativeElement;
    fixture.detectChanges();
  });

  describe('Size Variants', () => {
    it('should default to size "md"', () => {
      expect(component.size).toBe('md');
      expect(avatarElement.classList.contains('app-avatar--md')).toBe(true);
    });

    it('should render size "sm"', () => {
      component.size = 'sm';
      fixture.detectChanges();
      expect(avatarElement.classList.contains('app-avatar--sm')).toBe(true);
    });

    it('should render size "lg"', () => {
      component.size = 'lg';
      fixture.detectChanges();
      expect(avatarElement.classList.contains('app-avatar--lg')).toBe(true);
    });

    it('should change size dynamically', () => {
      const sizes: AvatarSize[] = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        component.size = size;
        fixture.detectChanges();
        expect(avatarElement.classList.contains(`app-avatar--${size}`)).toBe(
          true,
        );
      });
    });

    it('should remove old size class when switching', () => {
      component.size = 'sm';
      fixture.detectChanges();
      expect(avatarElement.classList.contains('app-avatar--sm')).toBe(true);

      component.size = 'lg';
      fixture.detectChanges();
      expect(avatarElement.classList.contains('app-avatar--sm')).toBe(false);
      expect(avatarElement.classList.contains('app-avatar--lg')).toBe(true);
    });
  });

  describe('Image Display', () => {
    it('should not display image when imageUrl is not provided', () => {
      component.imageUrl = undefined;
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img).toBeNull();
    });

    it('should display image when imageUrl is provided', () => {
      component.imageUrl = 'https://example.com/avatar.jpg';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img).toBeTruthy();
      expect((img.nativeElement as HTMLImageElement).src).toContain(
        'https://example.com/avatar.jpg',
      );
    });

    it('should set alt attribute for image', () => {
      component.imageUrl = 'https://example.com/avatar.jpg';
      component.ariaLabel = 'John Doe';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect((img.nativeElement as HTMLImageElement).alt).toBe('John Doe');
    });

    it('should update image URL dynamically', () => {
      component.imageUrl = 'https://example.com/avatar1.jpg';
      fixture.detectChanges();

      let img = fixture.debugElement.query(By.css('img'));
      expect((img.nativeElement as HTMLImageElement).src).toContain(
        'avatar1.jpg',
      );

      component.imageUrl = 'https://example.com/avatar2.jpg';
      fixture.detectChanges();

      img = fixture.debugElement.query(By.css('img'));
      expect((img.nativeElement as HTMLImageElement).src).toContain(
        'avatar2.jpg',
      );
    });

    it('should have rounded class for circular appearance', () => {
      component.imageUrl = 'https://example.com/avatar.jpg';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img.nativeElement.classList.contains('app-avatar__image')).toBe(
        true,
      );
    });
  });

  describe('Initials Fallback', () => {
    it('should not display initials when not provided', () => {
      component.initials = undefined;
      fixture.detectChanges();

      const initialsSpan = fixture.debugElement.query(
        By.css('.app-avatar__initials'),
      );
      expect(initialsSpan).toBeNull();
    });

    it('should display initials when provided', () => {
      component.initials = 'JD';
      fixture.detectChanges();

      const initialsSpan = fixture.debugElement.query(
        By.css('.app-avatar__initials'),
      );
      expect(initialsSpan).toBeTruthy();
      expect(initialsSpan.nativeElement.textContent).toBe('JD');
    });

    it('should display initials when image is not provided', () => {
      component.imageUrl = undefined;
      component.initials = 'AB';
      fixture.detectChanges();

      const initialsSpan = fixture.debugElement.query(
        By.css('.app-avatar__initials'),
      );
      expect(initialsSpan).toBeTruthy();
      expect(initialsSpan.nativeElement.textContent).toBe('AB');
    });

    it('should use image over initials when both are provided', () => {
      component.imageUrl = 'https://example.com/avatar.jpg';
      component.initials = 'JD';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      const initialsSpan = fixture.debugElement.query(
        By.css('.app-avatar__initials'),
      );

      expect(img).toBeTruthy();
      expect(initialsSpan).toBeNull();
    });

    it('should switch to initials when image URL is removed', () => {
      component.imageUrl = 'https://example.com/avatar.jpg';
      component.initials = 'JD';
      fixture.detectChanges();

      let img = fixture.debugElement.query(By.css('img'));
      expect(img).toBeTruthy();

      component.imageUrl = undefined;
      fixture.detectChanges();

      img = fixture.debugElement.query(By.css('img'));
      const initialsSpan = fixture.debugElement.query(
        By.css('.app-avatar__initials'),
      );

      expect(img).toBeNull();
      expect(initialsSpan).toBeTruthy();
      expect(initialsSpan.nativeElement.textContent).toBe('JD');
    });

    it('should support single character initials', () => {
      component.initials = 'A';
      fixture.detectChanges();

      const initialsSpan = fixture.debugElement.query(
        By.css('.app-avatar__initials'),
      );
      expect(initialsSpan.nativeElement.textContent).toBe('A');
    });

    it('should support multiple character initials', () => {
      component.initials = 'ABC';
      fixture.detectChanges();

      const initialsSpan = fixture.debugElement.query(
        By.css('.app-avatar__initials'),
      );
      expect(initialsSpan.nativeElement.textContent).toBe('ABC');
    });
  });

  describe('Accessibility - ariaLabel', () => {
    it('should not have aria-label by default', () => {
      expect(avatarElement.getAttribute('aria-label')).toBeNull();
    });

    it('should set aria-label when provided', () => {
      component.ariaLabel = 'User avatar for John Doe';
      fixture.detectChanges();
      expect(avatarElement.getAttribute('aria-label')).toBe(
        'User avatar for John Doe',
      );
    });

    it('should use aria-label for image alt text', () => {
      component.imageUrl = 'https://example.com/avatar.jpg';
      component.ariaLabel = 'Jane Smith';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect((img.nativeElement as HTMLImageElement).alt).toBe('Jane Smith');
    });

    it('should support aria-label with initials', () => {
      component.initials = 'JS';
      component.ariaLabel = 'Jane Smith initials';
      fixture.detectChanges();

      expect(avatarElement.getAttribute('aria-label')).toBe(
        'Jane Smith initials',
      );
    });
  });

  describe('Semantic HTML', () => {
    it('should render as div element', () => {
      const div = fixture.debugElement.query(By.css('div.app-avatar'));
      expect(div).toBeTruthy();
    });

    it('should have app-avatar class', () => {
      expect(avatarElement.classList.contains('app-avatar')).toBe(true);
    });

    it('should have role="img" for accessibility', () => {
      expect(avatarElement.getAttribute('role')).toBe('img');
    });
  });

  describe('No Ionic UI Elements', () => {
    it('should not render any ion-avatar elements', () => {
      const ionAvatar = fixture.debugElement.query(By.css('ion-avatar'));
      expect(ionAvatar).toBeNull();
    });

    it('should only render native HTML', () => {
      const ionElements = fixture.debugElement.queryAll(By.css('[ion-]'));
      expect(ionElements.length).toBe(0);
    });
  });

  describe('Combination Tests', () => {
    it('should handle avatar with image and aria-label', () => {
      component.imageUrl = 'https://example.com/avatar.jpg';
      component.ariaLabel = 'User profile picture';
      component.size = 'lg';
      fixture.detectChanges();

      const img = fixture.debugElement.query(By.css('img'));
      expect(img).toBeTruthy();
      expect((img.nativeElement as HTMLImageElement).alt).toBe(
        'User profile picture',
      );
      expect(avatarElement.classList.contains('app-avatar--lg')).toBe(true);
    });

    it('should handle avatar with initials and different sizes', () => {
      component.initials = 'MR';
      component.ariaLabel = 'Maria Rodriguez';

      const sizes: AvatarSize[] = ['sm', 'md', 'lg'];
      sizes.forEach((size) => {
        component.size = size;
        fixture.detectChanges();

        const initialsSpan = fixture.debugElement.query(
          By.css('.app-avatar__initials'),
        );
        expect(initialsSpan.nativeElement.textContent).toBe('MR');
        expect(avatarElement.classList.contains(`app-avatar--${size}`)).toBe(
          true,
        );
      });
    });

    it('should switch between image and initials at different sizes', () => {
      component.imageUrl = 'https://example.com/avatar.jpg';
      component.initials = 'AB';
      fixture.detectChanges();

      component.size = 'sm';
      fixture.detectChanges();
      expect(fixture.debugElement.query(By.css('img'))).toBeTruthy();

      component.imageUrl = undefined;
      component.size = 'lg';
      fixture.detectChanges();

      expect(fixture.debugElement.query(By.css('img'))).toBeNull();
      expect(
        fixture.debugElement.query(By.css('.app-avatar__initials')),
      ).toBeTruthy();
    });
  });

  describe('Multiple Avatar Instances', () => {
    it('should maintain independent state for different instances', () => {
      const fixture2 = TestBed.createComponent(AvatarComponent);
      const component2 = fixture2.componentInstance;

      component.imageUrl = 'https://example.com/avatar1.jpg';
      component.size = 'sm';

      component2.initials = 'AB';
      component2.size = 'lg';

      fixture.detectChanges();
      fixture2.detectChanges();

      const avatar1 = fixture.debugElement.query(By.css('.app-avatar'));
      const avatar2 = fixture2.debugElement.query(By.css('.app-avatar'));

      expect(avatar1.nativeElement.classList.contains('app-avatar--sm')).toBe(
        true,
      );
      expect(fixture.debugElement.query(By.css('img'))).toBeTruthy();

      expect(avatar2.nativeElement.classList.contains('app-avatar--lg')).toBe(
        true,
      );
      expect(
        fixture2.debugElement.query(By.css('.app-avatar__initials')),
      ).toBeTruthy();
    });
  });
});
