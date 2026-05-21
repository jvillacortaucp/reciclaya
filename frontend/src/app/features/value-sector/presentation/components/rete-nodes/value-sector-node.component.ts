import { ChangeDetectionStrategy, Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClassicPreset } from 'rete';
import { 
  LucideSprout, 
  LucidePackage, 
  LucideSparkles,
  LucideZap,
  LucideTrendingUp,
  LucideUtensils,
  LucidePill,
  LucideFlame,
  LucideFactory
} from '@lucide/angular';

@Component({
  selector: 'app-value-sector-node',
  standalone: true,
  imports: [
    CommonModule, 
    LucideSprout, 
    LucidePackage, 
    LucideSparkles, 
    LucideZap, 
    LucideTrendingUp,
    LucideUtensils,
    LucidePill,
    LucideFlame,
    LucideFactory
  ],
  template: `
    <div 
      class="rete-node group relative flex flex-col rounded-2xl border bg-slate-900/95 shadow-2xl backdrop-blur-xl transition-all duration-300"
      [class.border-emerald-500/50]="selected"
      [class.ring-2]="selected"
      [class.ring-emerald-500/20]="selected"
      [class.border-slate-700]="!selected"
      [style.width.px]="width"
      [style.height.px]="height"
    >
      <!-- Header -->
      <div class="flex items-center gap-3 border-b border-slate-800 px-4 py-3">
        <div 
          class="flex h-8 w-8 items-center justify-center rounded-lg shadow-inner"
          [ngClass]="iconBgClass"
        >
          @switch (iconName) {
            @case ('sprout') { <svg lucideSprout class="h-4.5 w-4.5"></svg> }
            @case ('utensils') { <svg lucideUtensils class="h-4.5 w-4.5"></svg> }
            @case ('sparkles') { <svg lucideSparkles class="h-4.5 w-4.5"></svg> }
            @case ('pill') { <svg lucidePill class="h-4.5 w-4.5"></svg> }
            @case ('flame') { <svg lucideFlame class="h-4.5 w-4.5"></svg> }
            @case ('factory') { <svg lucideFactory class="h-4.5 w-4.5"></svg> }
            @case ('package') { <svg lucidePackage class="h-4.5 w-4.5"></svg> }
            @default { <svg lucidePackage class="h-4.5 w-4.5"></svg> }
          }
        </div>
        <div class="flex-1 overflow-hidden">
          <p class="truncate text-[9px] font-bold uppercase tracking-wider text-slate-500">{{ typeLabel }}</p>
          <h4 class="truncate text-sm font-bold text-white">{{ label }}</h4>
        </div>
      </div>

      <!-- Body -->
      <div class="flex-1 px-4 py-3">
        @if (description) {
          <p class="line-clamp-2 text-[11px] leading-relaxed text-slate-400">{{ description }}</p>
        }

        @if (stats) {
          <div class="mt-3 flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
            <div class="flex items-center gap-1.5">
              <svg lucideZap class="h-3 w-3 text-amber-400"></svg>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ stats.leftLabel }}:</span>
              <span class="text-[10px] font-black text-white">{{ stats.leftValue }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <svg lucideTrendingUp class="h-3 w-3 text-emerald-400"></svg>
              <span class="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{{ stats.rightLabel }}:</span>
              <span class="text-[10px] font-black text-emerald-400">{{ stats.rightValue }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Ports -->
      <div class="absolute -left-1.5 top-1/2 flex -translate-y-1/2 flex-col gap-4">
        <div *ngFor="let input of (inputs | keyvalue)" class="input-socket h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-sm transition-transform hover:scale-125"></div>
      </div>
      <div class="absolute -right-1.5 top-1/2 flex -translate-y-1/2 flex-col gap-4">
        <div *ngFor="let output of (outputs | keyvalue)" class="output-socket h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-500 shadow-sm transition-transform hover:scale-125"></div>
      </div>

      <!-- Selected Indicator Glow -->
      <div *ngIf="selected" class="absolute -inset-1 -z-10 animate-pulse rounded-2xl bg-emerald-500/10 blur-md"></div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      user-select: none;
    }
    .rete-node {
      cursor: pointer;
    }
    .input-socket, .output-socket {
      cursor: crosshair;
    }
    .input-socket:hover, .output-socket:hover {
      background: #10b981;
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ValueSectorNodeComponent implements OnChanges {
  @Input() data!: ClassicPreset.Node;
  @Input() emit!: (data: any) => void;
  @Input() rendered!: () => void;

  protected label = '';
  protected typeLabel = '';
  protected description = '';
  protected iconName = 'package';
  protected iconBgClass = 'bg-slate-800 text-slate-400';
  protected width = 220;
  protected height = 120;
  protected selected = false;
  protected inputs: any = {};
  protected outputs: any = {};
  protected stats?: { leftLabel: string, leftValue: string, rightLabel: string, rightValue: string };

  ngOnChanges() {
    const nodeData = this.data as any;
    this.label = nodeData.label || 'Node';
    this.typeLabel = nodeData.typeLabel || 'Element';
    this.description = nodeData.description || '';
    this.iconName = nodeData.iconName || 'package';
    this.iconBgClass = nodeData.iconBgClass || 'bg-slate-800 text-slate-400';
    this.width = nodeData.width || 220;
    this.height = nodeData.height || 120;
    this.selected = nodeData.selected || false;
    this.inputs = nodeData.inputs || {};
    this.outputs = nodeData.outputs || {};
    this.stats = nodeData.stats;
    
    this.rendered();
  }
}
