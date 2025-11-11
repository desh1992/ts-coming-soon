'use client';

import { useEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';

import './image-trail.css';

type PointerEventLike = MouseEvent | TouchEvent;

const isTouchEvent = (event: PointerEventLike): event is TouchEvent => 'touches' in event;

function lerp(a: number, b: number, n: number): number {
  return (1 - n) * a + n * b;
}

function getLocalPointerPos(e: PointerEventLike, rect: DOMRect): { x: number; y: number } {
  if (isTouchEvent(e) && e.touches.length > 0) {
    const touch = e.touches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    };
  }

  const { clientX, clientY } = e as MouseEvent;

  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  };
}

function getMouseDistance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.hypot(dx, dy);
}

class ImageItem {
  public DOM: { el: HTMLDivElement; inner: HTMLDivElement | null };
  public defaultStyle: gsap.TweenVars = { scale: 1, x: 0, y: 0, opacity: 0 };
  public rect: DOMRect | null = null;
  private resize: () => void;

  constructor(DOM_el: HTMLDivElement) {
    this.DOM = {
      el: DOM_el,
      inner: DOM_el.querySelector<HTMLDivElement>('.content__img-inner'),
    };
    this.getRect();
    this.resize = () => {
      gsap.set(this.DOM.el, this.defaultStyle);
      this.getRect();
    };
    window.addEventListener('resize', this.resize);
  }

  private getRect() {
    this.rect = this.DOM.el.getBoundingClientRect();
  }

  destroy() {
    window.removeEventListener('resize', this.resize);
  }
}

interface ImageTrailController {
  destroy(): void;
}

type TrailItem = {
  url: string;
  label?: string;
};

type NormalizedItem = TrailItem & { id: string };

class ImageTrailVariant1 implements ImageTrailController {
  private container: HTMLDivElement;
  private images: ImageItem[];
  private imagesTotal: number;
  private imgPosition = 0;
  private zIndexVal = 1;
  private activeImagesCount = 0;
  private isIdle = true;
  private threshold = 80;
  private mousePos = { x: 0, y: 0 };
  private lastMousePos = { x: 0, y: 0 };
  private cacheMousePos = { x: 0, y: 0 };
  private renderFrame: number | null = null;
  private handlePointerMove: (ev: PointerEventLike) => void;
  private startRender: (ev: PointerEventLike) => void;

  constructor(container: HTMLDivElement) {
    this.container = container;
    this.images = [...container.querySelectorAll<HTMLDivElement>('.content__img')].map(
      (img) => new ImageItem(img)
    );
    this.imagesTotal = this.images.length;

    this.handlePointerMove = (ev: PointerEventLike) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
    };

    this.startRender = (ev: PointerEventLike) => {
      const rect = this.container.getBoundingClientRect();
      this.mousePos = getLocalPointerPos(ev, rect);
      this.cacheMousePos = { ...this.mousePos };
      this.renderFrame = requestAnimationFrame(this.render);
      this.container.removeEventListener('mousemove', this.startRender as EventListener);
      this.container.removeEventListener('touchmove', this.startRender as EventListener);
    };

    this.container.addEventListener('mousemove', this.handlePointerMove);
    this.container.addEventListener('touchmove', this.handlePointerMove, { passive: true });
    this.container.addEventListener('mousemove', this.startRender as EventListener);
    this.container.addEventListener('touchmove', this.startRender as EventListener, { passive: true });
  }

  private render = () => {
    const distance = getMouseDistance(this.mousePos, this.lastMousePos);
    this.cacheMousePos.x = lerp(this.cacheMousePos.x, this.mousePos.x, 0.1);
    this.cacheMousePos.y = lerp(this.cacheMousePos.y, this.mousePos.y, 0.1);

    if (distance > this.threshold) {
      this.showNextImage();
      this.lastMousePos = { ...this.mousePos };
    }

    if (this.isIdle && this.zIndexVal !== 1) {
      this.zIndexVal = 1;
    }

    this.renderFrame = requestAnimationFrame(this.render);
  };

  private showNextImage() {
    if (!this.imagesTotal) return;

    this.zIndexVal += 1;
    this.imgPosition = this.imgPosition < this.imagesTotal - 1 ? this.imgPosition + 1 : 0;

    const img = this.images[this.imgPosition];
    const width = img.rect?.width ?? 0;
    const height = img.rect?.height ?? 0;

    gsap.killTweensOf(img.DOM.el);

    gsap
      .timeline({
        onStart: () => this.onImageActivated(),
        onComplete: () => this.onImageDeactivated(),
      })
      .fromTo(
        img.DOM.el,
        {
          opacity: 1,
          scale: 1,
          zIndex: this.zIndexVal,
          x: this.cacheMousePos.x - width / 2,
          y: this.cacheMousePos.y - height / 2,
        },
        {
          duration: 0.4,
          ease: 'power1',
          x: this.mousePos.x - width / 2,
          y: this.mousePos.y - height / 2,
        },
        0
      )
      .to(
        img.DOM.el,
        {
          duration: 0.8,
          ease: 'power3',
          opacity: 0,
          scale: 0.2,
        },
        0.6
      );
  }

  private onImageActivated() {
    this.activeImagesCount += 1;
    this.isIdle = false;
  }

  private onImageDeactivated() {
    this.activeImagesCount -= 1;
    if (this.activeImagesCount === 0) {
      this.isIdle = true;
    }
  }

  destroy() {
    this.images.forEach((image) => image.destroy());
    this.container.removeEventListener('mousemove', this.handlePointerMove);
    this.container.removeEventListener('touchmove', this.handlePointerMove);
    this.container.removeEventListener('mousemove', this.startRender as EventListener);
    this.container.removeEventListener('touchmove', this.startRender as EventListener);

    if (this.renderFrame) {
      cancelAnimationFrame(this.renderFrame);
    }
  }
}

const variantMap: Partial<Record<number, new (container: HTMLDivElement) => ImageTrailController>> = {
  1: ImageTrailVariant1,
};

interface ImageTrailProps {
  items?: (string | TrailItem)[];
  variant?: number;
}

function normalizeItems(items: (string | TrailItem)[]): NormalizedItem[] {
  return items.map((item, index) =>
    typeof item === 'string'
      ? { id: `${index}`, url: item }
      : {
          id: `${index}`,
          url: item.url,
          label: item.label,
        }
  );
}

export default function ImageTrail({ items = [], variant = 1 }: ImageTrailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const normalizedItems = useMemo(() => normalizeItems(items), [items]);
  const itemsKey = useMemo(
    () => JSON.stringify(normalizedItems.map(({ url, label }) => ({ url, label }))),
    [normalizedItems]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const VariantCls = variantMap[variant] ?? ImageTrailVariant1;
    const instance = new VariantCls(container);

    return () => {
      instance.destroy();
    };
  }, [variant, itemsKey]);

  return (
    <div className="content" ref={containerRef}>
      {normalizedItems.map(({ id, url, label }) => (
        <div className="content__img" key={id}>
          <div className="content__img-inner" style={{ backgroundImage: `url(${url})` }} />
          {label && (
            <div className="content__img-overlay">
              <span className="content__img-label">{label}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

