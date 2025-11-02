import { Component, Input, OnChanges, SimpleChanges, OnInit} from "@angular/core";
import { Cut } from "../home/app.EventInterface";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-cut-editor-component',
  templateUrl: 'app.CutEditorComponent.html',
  styleUrl: 'app.CutEditorComponent.css',
  imports: [CommonModule, FormsModule]
})

export class CutEditorComponent implements OnInit{
  @Input() dayCuts : Cut[] = [];
  @Input() selectedCut! : Cut;

  overlappingCuts : number[] = []
  startH = 0;
  startMin = 0;
  endH = 0;
  endMin = 0;

  ngOnInit(): void {
    this.setupState();
  }

  setupState(): void {
    if (!this.selectedCut) return;

    this.startH = this.selectedCut.timestamp_start.getHours();
    this.startMin = this.selectedCut.timestamp_start.getMinutes();
    this.endH = this.selectedCut.timestamp_end.getHours();
    this.endMin = this.selectedCut.timestamp_end.getMinutes();
    this.updateOverlaps();
  }

  updateOverlaps() : void {
    if (!this.selectedCut) return;

    this.overlappingCuts = []

    const { timestamp_start, timestamp_end} = this.selectedCut;

    this.dayCuts.forEach( ev => {
      if (
        ev.id !== this.selectedCut.id &&
        ev.timestamp_start.getFullYear() === timestamp_start.getFullYear() &&
        ev.timestamp_start.getMonth() === timestamp_start.getMonth() &&
        ev.timestamp_start.getDate() === timestamp_start.getDate() &&
        this.checkOverlap(timestamp_start, timestamp_end, ev.timestamp_start, ev.timestamp_end)
      ){
        this.overlappingCuts.push(ev.id);
      }
    });
  }

  checkOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA < endB && startB < endA;
  }

  isOverlapping(id: number) : boolean {
    return this.overlappingCuts.includes(id);
  }

  isSelected(id: number) : boolean {
    return this.selectedCut.id === id;
  }

  onChangeSelectedCutStartH(): void {
    if (!this.selectedCut) return;
    this.selectedCut.timestamp_start.setHours(this.startH);
    this.updateOverlaps();
  }

  onChangeSelectedCutStartMin(): void {
    if (!this.selectedCut) return;
    this.selectedCut.timestamp_start.setMinutes(this.startMin);
    this.updateOverlaps();
  }

  onChangeSelectedCutEndH(): void {
    if (!this.selectedCut) return;
    this.selectedCut.timestamp_end.setHours(this.endH);
    this.updateOverlaps();
  }

  onChangeSelectedCutEndMin(): void {
    if (!this.selectedCut) return;
    this.selectedCut.timestamp_end.setMinutes(this.endMin);
    this.updateOverlaps();
  }

  onChangeSelectedCut(id : number) : void {
    this.selectedCut = this.dayCuts.find( ev => ev.id === id)!;
    this.setupState();
  }
}


