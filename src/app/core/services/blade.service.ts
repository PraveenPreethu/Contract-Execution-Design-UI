import { Injectable, signal, Type } from '@angular/core';
import { BladeConfig } from '../models';

@Injectable({ providedIn: 'root' })
export class BladeService {
  readonly blades = signal<BladeConfig[]>([]);

  open<T>(component: Type<T>, title: string, inputs?: Record<string, any>, width?: string): void {
    const id = `blade-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.blades.update(stack => [...stack, { id, component, title, inputs, width }]);
  }

  close(id?: string): void {
    this.blades.update(stack => {
      if (id) return stack.filter(b => b.id !== id);
      return stack.slice(0, -1);
    });
  }

  closeAll(): void {
    this.blades.set([]);
  }

  closeFrom(id: string): void {
    this.blades.update(stack => {
      const idx = stack.findIndex(b => b.id === id);
      return idx >= 0 ? stack.slice(0, idx) : stack;
    });
  }

  get hasBlades(): boolean {
    return this.blades().length > 0;
  }
}
