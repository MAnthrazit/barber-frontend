import { Component, OnInit } from "@angular/core";
import { AuthService } from "../login/app.AuthService";
import { DashboardService } from "./app.DashboardService";
import { CommonModule } from "@angular/common";
import { Cut } from "../home/app.EventInterface";
import { HomeService } from "../home/app.HomeService";
import { map } from "rxjs";

@Component({
  selector: 'app-dashboard-component',
  templateUrl: 'app.DashboardComponent.html',
  styleUrl: 'app.DashboardComponent.css',
  imports: [CommonModule]
})

export class DashboardComponent implements OnInit{
  constructor(private dashboardService: DashboardService, private home : HomeService){}


  months = [
    { name: 'Januar', days: 31 },
    { name: 'Februar', days: 28 },
    { name: 'März', days: 31 },
    { name: 'April', days: 30 },
    { name: 'Mai', days: 31 },
    { name: 'Juni', days: 30 },
    { name: 'Juli', days: 31 },
    { name: 'August', days: 31 },
    { name: 'September', days: 30 },
    { name: 'Oktober', days: 31 },
    { name: 'November', days: 30 },
    { name: 'Dezember', days: 31 }
  ];

  monthMap = new Map<string, Set<Cut>>();
  monthKeys: string[] = [];

  weekdays : string[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  minMonthIndex : number = 0;
  maxMonthIndex : number = this.months.length - 1;
  currentMonthIndex : number= this.minMonthIndex;

  selectedDay: { monthIndex: number; day: number; year: number } | null = null;
  events : Cut[] = [];

  ngOnInit(): void {
    const today : Date = new Date();
    this.minMonthIndex  = today.getMonth();
    this.currentMonthIndex = this.minMonthIndex;

    this.months[1].days = this.isLeapYear(today.getFullYear()) ? 29: 28;
    this.selectedDay = { monthIndex: this.currentMonthIndex, day: today.getDate(), year: today.getFullYear() };

    this.getCuts();
    this.updateDayStatusMap();
  }


  getCuts() : void {
    this.home.getCuts().pipe(
      map((events : any[]) =>
          events.map((event : any)  => ({
            id: event.id,
            timestamp_start: new Date(event.timestamp_start),
            timestamp_end: new Date(event.timestamp_end),
            clients: event.clients,
            name: event.name,
            state: event.state,
            comment: event.comment,
          }))
      )
    ).subscribe((cuts: Cut[]) => {
      this.events = cuts;
    });
  }

  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  }

  getDaysInMonth(month: any): number[] {
    return Array.from({ length: month.days }, (_, i) => i + 1);
  }

  getOffset(month: { name: string; days: number }): undefined[] {
    const year = new Date().getFullYear();
    const monthIndex = this.months.findIndex(m => m.name === month.name);
    const firstDay = new Date(year, monthIndex, 1).getDay(); // 0 (Sun) to 6 (Sat)
    return Array(firstDay);
  }

  get currentMonth() {
    return this.months[this.currentMonthIndex];
  }

  get isAtMinMonth(): boolean {
    return this.currentMonthIndex <= this.minMonthIndex;
  }

  get isAtMaxMonth(): boolean {
    return this.currentMonthIndex >= this.maxMonthIndex;
  }

  prevMonth(): void {
    if (!this.isAtMinMonth) {
      this.currentMonthIndex--;
      this.updateSelectedDayAfterMonthChange();
    }
  }

  nextMonth(): void {
    if (!this.isAtMaxMonth) {
      this.currentMonthIndex++;
      this.updateSelectedDayAfterMonthChange();
    }
  }

  updateSelectedDayAfterMonthChange() {
    const now = new Date();
    const year = now.getFullYear();
    const month = this.currentMonthIndex;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(now.setHours(0, 0, 0, 0));

    for (let day = 1; day <= daysInMonth; day++) {
      const candidateDate = new Date(year, month, day);
      if (candidateDate >= today) {
        this.selectedDay = {
          year: year,
          monthIndex: month,
          day: day
        };
        return;
      }
    }

   this.selectedDay = null;
  }

  isSelected(monthIndex: number, day: number): boolean {
    return (
      this.selectedDay?.monthIndex === monthIndex &&
        this.selectedDay?.day === day
    );
  }

  isSelectedMonth(month: string): boolean{
    const monthIndex = this.months.findIndex(m => m.name === month);
    return monthIndex === this.selectedDay?.monthIndex;
  }

  isPastDay(monthIndex: number, day: number): boolean {
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), monthIndex, day);
    return currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  getEventsForSelectedDay() {
    if (!this.selectedDay) return [];

    const eventsForDay = this.events.filter(e => {
      return (
        e.timestamp_start.getFullYear() === new Date().getFullYear() &&
          e.timestamp_start.getMonth() === (this.selectedDay!.monthIndex) &&
          e.timestamp_start.getDate() === this.selectedDay!.day
      );
    });

    return eventsForDay.sort((a, b) => a.timestamp_start.getTime() - b.timestamp_start.getTime());
  }


  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  hasEntry(day: number): boolean {
    const monthName = this.months[this.currentMonthIndex].name;

    if (this.monthMap.has(monthName)) {
      const cuts: Set<Cut> = this.monthMap.get(monthName)!;

      for (const cut of cuts) {
        if (cut.timestamp_start.getDate() === day) {
          return true;
        }
      }
    }

    return false;
  }

  onReject(event: Event, id : number) : void {
    event.preventDefault();

    this.dashboardService.rejectRequest(id).subscribe(
    () => {
      this.events = this.events.filter(c => c.id !== id);
    },
      (error) => console.error("Failed to reject cut", error)
    );
  }

  onAccept(event: Event, id : number) : void {
    event.preventDefault();

    this.dashboardService.acceptRequest(id).pipe(
      map(event => ({
            id: event.id,
            timestamp_start: new Date(event.timestamp_start),
            timestamp_end: new Date(event.timestamp_end),
            clients: event.clients,
            name: event.name,
            state: event.state,
            comment: event.comment,
      }))
    ).subscribe(
      (mappedCut: Cut) => {
        const index = this.events.findIndex(c => c.id === id);
        if (index > -1) {
          this.events[index] = mappedCut;
        }
      },
      error => console.error('Failed to accept cut', error)
    );
  }

  onEdit(event: Event, id: number):void {
  }

  onInsertHoliday(event: Event) : void{
    event.preventDefault();

    this.dashboardService.insertHoliday([]).subscribe(
      (dates : Date[]) => {
        console.log('days add');
      },
      () => {
        console.error('days rejected');
      }
    );
  }

  toggleDay(monthIndex: number, day: number): void {
    if (this.isPastDay(monthIndex, day)) return;

    const today : Date = new Date();

    this.selectedDay = { monthIndex: monthIndex, day: day, year: today.getFullYear() };
  }

  switchMonth(event : Event, month: string): void {
    event.preventDefault();

    const monthIndex = this.months.findIndex(m => m.name === month);
    this.currentMonthIndex = monthIndex;
    this.updateSelectedDayAfterMonthChange();
  }


  updateDayStatusMap(): void {
    this.monthMap.clear();

    this.events.forEach(event => {
      const eventDate = event.timestamp_start;
      const monthIndex = eventDate.getMonth();
      const dayOfMonth = eventDate.getDate();

      if (!this.isPastDay(monthIndex, dayOfMonth)) {
        const monthName = this.months[monthIndex].name;

        if (!this.monthMap.has(monthName)) {
          this.monthMap.set(monthName, new Set<Cut>());
        }

        this.monthMap.get(monthName)!.add(event);
      }
    });

    this.monthKeys = Array.from(this.monthMap.keys());
  }

  onDeleteHolidays(event : Event){
    event.preventDefault();

    this.dashboardService.deleteHoliday([]).subscribe(
      (dates: Date[]) => {
        console.log('holidays deleted');
      },
      () => {
        console.error('error deleting holidays');
      }
    )
  }
}


