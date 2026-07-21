import { Directive, input, booleanAttribute, HostListener } from '@angular/core';

@Directive({
  selector: 'button[fcButton], a[fcButton]',
  standalone: true,
  host: {
    '[class.fc-btn]': 'true',
    '[class.fc-btn-primary]': 'variant() === "primary"',
    '[class.fc-btn-ghost]': 'variant() === "ghost"',
    '[class.fc-btn-nav]': 'variant() === "nav"',
    '[class.fc-btn-elevated]': 'elevated()',
    '[class.fc-btn-sm]': 'size() === "sm"',
    '[class.fc-btn-md]': 'size() === "md"',
    '[class.fc-btn-icon]': 'size() === "icon"',
    '[class.fc-btn-full]': 'fullWidth()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null'
  }
})
export class FcButtonDirective {
  variant = input<'primary' | 'ghost' | 'nav'>('primary');
  size = input<'sm' | 'md' | 'icon'>('md');
  elevated = input<boolean, unknown>(false, { transform: booleanAttribute });
  disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  fullWidth = input<boolean, unknown>(false, { transform: booleanAttribute });

  @HostListener('click', ['$event'])
  onClick(event: Event) {
    if (this.disabled()) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}
