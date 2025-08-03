import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../login/app.AuthService";
import { HomeService } from "./app.HomeService";
import { Cut } from "./app.EventInterface";
import { Observable, map, timestamp } from 'rxjs';

@Component({
  selector: 'app-home-component',
  templateUrl: 'app.HomeComponent.html',
  styleUrl: 'app.HomeComponent.css',
  imports: [CommonModule, FormsModule]
})

export class HomeComponent implements OnInit{

  constructor(private auth: AuthService, private home: HomeService) {}

  name : string = '';
  email : string = '';
  clients : number = 1;
  comment : string = '';
  h : number = 0;
  min : number = 0;

  events : Cut[] = [];

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

  weekdays : string[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  minMonthIndex : number = 0; //Jan
  maxMonthIndex : number = this.months.length - 1; //Dez
  currentMonthIndex : number= this.minMonthIndex;


  selectedDay: { monthIndex: number; day: number; year: number } | null = null;

  ngOnInit(): void {
    const today : Date = new Date();
    this.minMonthIndex  = today.getMonth();
    this.currentMonthIndex = this.minMonthIndex;

    this.h = today.getHours();
    this.min = today.getMinutes();

    this.months[1].days = this.isLeapYear(today.getFullYear()) ? 29: 28;
    this.selectedDay = { monthIndex: this.currentMonthIndex, day: today.getDate(), year: today.getFullYear() };

    this.getCutsData(today);
  }

  getCutsData(today: Date) : void {
    this.home.getCutsRequest(today.toISOString()).pipe(
      map((events : any[]) =>
          events.map((event : any)  => ({
            id: event.id,
            timestamp_start: new Date(event.timestamp_start),
            timestamp_end: new Date(event.timestamp_end),
            clients: event.clients,
            name: event.name ?? 'Haarschnitt',
            state: event.state ?? 0,
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

  addClient(event : Event) : void{
    event.preventDefault();
    if (this.clients <  9){
      this.clients ++;
    }
  }

  deleteClient(event: Event) : void {
    event.preventDefault();
    if (this.clients > 1){
      this.clients --;
    }
  }

  isSelected(monthIndex: number, day: number): boolean {
    return (
      this.selectedDay?.monthIndex === monthIndex &&
        this.selectedDay?.day === day
    );
  }

  isPastDay(monthIndex: number, day: number): boolean {
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), monthIndex, day);
    return currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  toggleDay(monthIndex: number, day: number): void {
    if (this.isPastDay(monthIndex, day)) return;

    const today : Date = new Date();

    this.selectedDay = { monthIndex: monthIndex, day: day, year: today.getFullYear() };
  }

  getEventsForSelectedDay() {
    if (!this.selectedDay) return [];

    const eventsForDay = this.events.filter(e => {
      return (
        e.timestamp_start.getFullYear() === new Date().getFullYear() &&
          e.timestamp_start.getMonth() === this.selectedDay!.monthIndex &&
          e.timestamp_start.getDate() === this.selectedDay!.day
      );
    });

    return eventsForDay.sort((a, b) => a.timestamp_start.getTime() - b.timestamp_start.getTime());
  }

  appendRequest(event: Event){
    event.preventDefault();

    if (!this.selectedDay) return;

    const start : Date = new Date(
      this.selectedDay.year,
      this.selectedDay.monthIndex,
      this.selectedDay.day,
      this.h,
      this.min
    );

    console.log(start);

    const end : Date = new Date(start.getTime() + 35 * 60000);

    const conflicts : boolean= this.events.some(ev => {
      return (
        ev.timestamp_start.getFullYear() === ev.timestamp_start.getFullYear() &&
        ev.timestamp_start.getMonth() === start.getMonth() &&
        ev.timestamp_start.getDate() === start.getDate() &&
        this.doesOverlap(start, end, ev.timestamp_start, new Date(ev.timestamp_start.getTime() + (35 * this.clients) * 60000))
      );
    });

    if (conflicts) {
      console.error('Overlap Error');
      return;
    }


    const body = {
      name: this.name,
      email: this.email,
      clients: this.clients,
      comment: this.comment,
      timestamp_start: start.toISOString(),
      timestamp_end: start.toISOString(),
    };

    this.home.addRequest(body).subscribe(
      (res: Cut) => {
        this.events.push({
          id: res.id,
          name: 'Haarschnitt',
          timestamp_start: start,
          timestamp_end: end,
          clients: res.clients,
          state: res.state,
        });
      },
      (error) => {
        console.error("Request denied")
      }
    )
  }

  refreshEvents(event: Event): void {
    event.preventDefault();

    const date = new Date(
      this.selectedDay?.year!,
      this.selectedDay?.monthIndex!,
      this.selectedDay?.day!,
      0, 0, 0
    );

    this.getCutsData(date);
  }

  doesOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA < endB && startB < endA;
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
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
}
