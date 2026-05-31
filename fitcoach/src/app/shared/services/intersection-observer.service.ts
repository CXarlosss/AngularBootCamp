import { Injectable, OnDestroy } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class IntersectionObserverService implements OnDestroy {
  private observers = new Map<Element, IntersectionObserver>();

  observe(
    elements: NodeListOf<Element> | Element[],
    callback: (entry: IntersectionObserverEntry) => void,
    options?: IntersectionObserverInit
  ) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => callback(entry));
    }, options);

    elements.forEach(el => {
      observer.observe(el);
      this.observers.set(el, observer);
    });
  }

  unobserve(element: Element) {
    const observer = this.observers.get(element);
    if (observer) {
      observer.unobserve(element);
      this.observers.delete(element);
    }
  }

  ngOnDestroy() {
    this.observers.forEach((observer, element) => {
      observer.disconnect();
    });
    this.observers.clear();
  }
}
