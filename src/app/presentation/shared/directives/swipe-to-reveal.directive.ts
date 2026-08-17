import { Directive, ElementRef, HostListener, effect, inject, input, output } from '@angular/core';

/**
 * Adds a horizontal swipe-left-to-reveal interaction to a list-row host
 * element (iOS Mail / Gmail style). Meant to sit in front of an actions
 * panel positioned behind it (see new-log.page.html's item rows) inside an
 * `overflow: hidden` wrapper — swiping left slides the host out of the way
 * to reveal that panel; swiping right (or an external `[revealed]="false"`)
 * slides it back to cover it.
 *
 * Distinguishes a horizontal swipe from vertical page-scrolling by waiting
 * for a small movement threshold before locking the gesture's axis, so a
 * finger moving mostly vertically never hijacks the page scroll.
 */
@Directive({
  selector: '[appSwipeToReveal]',
  standalone: true,
})
export class SwipeToRevealDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** How far (px) the host slides left when revealed — should match the actions panel's width. */
  readonly swipeRevealWidth = input(72);

  /** External control: set true to force this row open (e.g. after its own gesture), false to force it closed (e.g. another row just opened). */
  readonly revealed = input(false);

  /** Emits the row's new revealed state once a drag gesture completes. */
  readonly revealedChange = output<boolean>();

  private pointerId: number | null = null;
  private startX = 0;
  private startY = 0;
  private startOffset = 0;
  private currentOffset = 0;
  private isDragging = false;
  private axisLock: 'horizontal' | 'vertical' | null = null;

  constructor() {
    // Reflects external [revealed] changes (e.g. another row swiped open,
    // forcing this one shut) — skipped mid-gesture so it doesn't fight the
    // user's own finger.
    effect(() => {
      const shouldBeRevealed = this.revealed();
      if (!this.isDragging) {
        this.applyOffset(shouldBeRevealed ? -this.swipeRevealWidth() : 0, true);
      }
    });
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }

    this.pointerId = event.pointerId;
    this.startX = event.clientX;
    this.startY = event.clientY;
    this.startOffset = this.revealed() ? -this.swipeRevealWidth() : 0;
    this.currentOffset = this.startOffset;
    this.isDragging = true;
    this.axisLock = null;
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging || event.pointerId !== this.pointerId) {
      return;
    }

    const deltaX = event.clientX - this.startX;
    const deltaY = event.clientY - this.startY;

    if (!this.axisLock) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) {
        return;
      }
      this.axisLock = Math.abs(deltaX) > Math.abs(deltaY) ? 'horizontal' : 'vertical';
      if (this.axisLock === 'horizontal') {
        const host = this.elementRef.nativeElement;
        host.style.willChange = 'transform';
        host.style.transition = 'none';
        try {
          host.setPointerCapture(event.pointerId);
        } catch {
          // Pointer capture is not available in every browser context.
        }
      } else {
        // Vertical drag: abandon the swipe gesture and let the page scroll normally.
        this.isDragging = false;
        this.pointerId = null;
        return;
      }
    }

    if (this.axisLock !== 'horizontal') {
      return;
    }

    const width = this.swipeRevealWidth();
    this.currentOffset = Math.min(0, Math.max(-width, this.startOffset + deltaX));
    this.applyOffset(this.currentOffset, false);
    event.preventDefault();
  }

  @HostListener('pointerup', ['$event'])
  onPointerUp(event: PointerEvent): void {
    this.finishGesture(event.pointerId);
  }

  @HostListener('pointercancel', ['$event'])
  onPointerCancel(event: PointerEvent): void {
    this.finishGesture(event.pointerId);
  }

  private finishGesture(pointerId: number): void {
    if (!this.isDragging || pointerId !== this.pointerId) {
      return;
    }
    const wasHorizontalDrag = this.axisLock === 'horizontal';
    this.isDragging = false;
    this.pointerId = null;
    this.axisLock = null;

    if (!wasHorizontalDrag) {
      return;
    }

    const width = this.swipeRevealWidth();
    const shouldReveal = this.currentOffset <= -width / 2;
    this.applyOffset(shouldReveal ? -width : 0, true);
    this.revealedChange.emit(shouldReveal);
  }

  private applyOffset(offset: number, animate: boolean): void {
    const host = this.elementRef.nativeElement;
    host.style.transition = animate ? 'transform 180ms ease-out' : 'none';
    host.style.transform = `translate3d(${offset}px, 0, 0)`;
  }
}
