import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ColoresBarraProgresoService {

  getBarColor(value : number): string {
    const safeValue = Math.max(0, Math.min(value, 100));
    return this.getColorByProgress(safeValue);
  }

  private getColorByProgress(value: number): string {
    if (value <= 20) {
      return this.interpolate('#f44336', '#ff5722', value / 20);
    }

    if (value <= 40) {
      return this.interpolate('#ff5722', '#ff9800', (value - 20) / 20);
    }

    if (value <= 60) {
      return this.interpolate('#ff9800', '#ffeb3b', (value - 40) / 20);
    }

    if (value <= 80) {
      return this.interpolate('#ffeb3b', '#8bc34a', (value - 60) / 20);
    }

    return this.interpolate('#8bc34a', '#2e7d32', Math.min((value - 80) / 20, 1));
  }

  private interpolate(c1: string, c2: string, factor: number): string {
    const a = this.hexToRgb(c1);
    const b = this.hexToRgb(c2);

    const r = Math.round(a.r + factor * (b.r - a.r));
    const g = Math.round(a.g + factor * (b.g - a.g));
    const bC = Math.round(a.b + factor * (b.b - a.b));

    return `rgb(${r}, ${g}, ${bC})`;
  }

  private hexToRgb(hex: string) {
    const num = parseInt(hex.replace('#', ''), 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }
}
