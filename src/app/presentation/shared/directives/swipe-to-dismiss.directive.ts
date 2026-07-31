import {
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';

/**
 * Adds a downward drag-to-dismiss interaction to a page-like host element.
 * The gesture only starts when the pointer begins inside the configured handle.
 */
@Directive({
  selector: '[appSwipeToDismiss]',
  standalone: true,
})
export class SwipeToDismissDirective implements OnDestroy {
  @Input() swipeHandleSelector = '.page-header';
  @Input() swipeDismissThreshold = 120;

  /** Allows consumers to turn the gesture off without removing the directive. */
  @Input() swipeToDismissEnabled = true;

  /** Interactive elements inside the handle that must keep their own behavior. */
  @Input() swipeIgnoreSelector =
    'button, a, input, textarea, select, [contenteditable="true"]';

  @Output() swipeDismissed = new EventEmitter<void>();

  private pointerId: number | null = null;
  private startY = 0;
  private currentOffset = 0;
  private isDragging = false;
  private dismissTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly elementRef: ElementRef<HTMLElement>) {}

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (
      !this.swipeToDismissEnabled ||
      this.isDragging ||
      (event.pointerType === 'mouse' && event.button !== 0)
    ) {
      return;
    }

    const target = event.target as Element | null;
    if (!target?.closest(this.swipeHandleSelector)) {
      return;
    }

    if (this.swipeIgnoreSelector && target.closest(this.swipeIgnoreSelector)) {
      return;
    }

    this.pointerId = event.pointerId;
    this.startY = event.clientY;
    this.currentOffset = 0;
    this.isDragging = true;

    const host = this.elementRef.nativeElement;
    host.style.willChange = 'transform, opacity';
    host.style.transition = 'none';

    try {
      host.setPointerCapture(event.pointerId);
    } catch {
      // Pointer capture is not available in every browser context.
    }
  }

  @HostListener('pointermove', ['$event'])
  onPointerMove(event: PointerEvent): void {
    if (!this.isDragging || event.pointerId !== this.pointerId) {
      return;
    }

    this.currentOffset = Math.max(0, event.clientY - this.startY);
    const host = this.elementRef.nativeElement;
    host.style.transform = `translate3d(0, ${this.currentOffset}px, 0)`;
    host.style.opacity = String(1 - Math.min(this.currentOffset / 480, 0.25));
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

  ngOnDestroy(): void {
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }
    this.resetHostStyles();
  }

  private finishGesture(pointerId: number): void {
    if (!this.isDragging || pointerId !== this.pointerId) {
      return;
    }

    const shouldDismiss = this.currentOffset >= this.swipeDismissThreshold;
    this.isDragging = false;
    this.pointerId = null;

    if (shouldDismiss) {
      const host = this.elementRef.nativeElement;
      host.style.transition =
        'transform 180ms ease-out, opacity 180ms ease-out';
      host.style.transform = 'translate3d(0, 100%, 0)';
      host.style.opacity = '0';
      this.dismissTimeout = setTimeout(() => {
        this.swipeDismissed.emit();
        this.dismissTimeout = null;
      }, 180);
      return;
    }

    const host = this.elementRef.nativeElement;
    host.style.transition = 'transform 180ms ease-out, opacity 180ms ease-out';
    host.style.transform = '';
    host.style.opacity = '';
    this.dismissTimeout = setTimeout(() => {
      this.resetHostStyles();
      this.dismissTimeout = null;
    }, 180);
  }

  private resetHostStyles(): void {
    const host = this.elementRef.nativeElement;
    host.style.transform = '';
    host.style.opacity = '';
    host.style.transition = '';
    host.style.willChange = '';
  }
}
