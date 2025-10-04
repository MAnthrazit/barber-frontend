import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HomeService } from "./app.HomeService";
import { Cut } from "./app.EventInterface";
import { Holiday } from "../holiday/app.HolidayInterface";
import { HolidayService } from "../holiday/app.HolidayService";

@Component({
  selector: 'app-home-component',
  templateUrl: 'app.HomeComponent.html',
  styleUrl: 'app.HomeComponent.css',
  imports: [CommonModule, FormsModule]
})

export class HomeComponent implements OnInit{

  constructor(private home: HomeService, private holidayService: HolidayService) {}

  name : string = '';
  email : string = '';
  clients : number = 1;
  comment : string = '';
  h : number = 0;
  min : number = 0;

  events : Cut[] = [];
  holidays : Holiday[] = [];

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
    const now = new Date();
    this.minMonthIndex = now.getMonth();
    this.currentMonthIndex = this.minMonthIndex;

    this.h = now.getHours();
    this.min = now.getMinutes();

    this.months[1].days = this.isLeapYear(now.getFullYear()) ? 29 : 28;
    this.getHolidaysData();
    this.getCutsData();
  }

  skipCandidates(date: Date): Date {
    let candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);

    let moved = true;
    while (moved) {
      moved = false;
      for (const holiday of this.holidays) {
        const start = new Date(holiday.timestamp_start);
        start.setHours(0, 0, 0, 0);

        const end = new Date(holiday.timestamp_end);
        end.setHours(0, 0, 0, 0);

        if (candidate >= start && candidate <= end) {
          candidate = new Date(end);
          candidate.setDate(candidate.getDate() + 1);
          moved = true;
          break;
        }
      }
    }
    return candidate;
  }

  getCutsData() : void {
    if (!this.selectedDay) return;

    const year = this.selectedDay?.year!;
    const month = String(this.selectedDay?.monthIndex!).padStart(2, '0'); // is already 1+
    const day = String(this.selectedDay?.day!).padStart(2, '0');

    const dateString = `${year}-${month}-${day}`;

    this.home.getAcceptedCuts(dateString).subscribe({
      next: (cuts: Cut[]) => {
        this.events = cuts;
      },
      error: (err) => {
        console.error(`Failed to fetch request`, err);
      }
    });
  }

  getHolidaysData() : void {
    this.holidayService.getHolidays().subscribe({
      next: (res : Holiday[]) => {
        this.holidays = res;


      const candidate = this.skipCandidates(new Date());
      this.selectedDay = {
        monthIndex: candidate.getMonth(),
        day: candidate.getDate(),
        year: candidate.getFullYear()
      }
      this.getCutsData()},
      error: (err) => {
        console.error(`Failed to fetch holidays`, err);
      }
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

  isHoliday(monthIndex: number, day: number): boolean {
    const year = new Date().getFullYear();
    const currentDate = new Date(year, monthIndex, day).setHours(0, 0, 0, 0);

    return this.holidays.some(holiday => {
      const start = new Date(holiday.timestamp_start).setHours(0, 0, 0, 0);
      const end = new Date(holiday.timestamp_end).setHours(0, 0, 0, 0);

      return currentDate >= start && currentDate <= end;
    });
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

  get calculatedTime(): string {
    if (this.h == null || this.min == null || this.clients == null) {
      return '';
    }

    const start = new Date();
    start.setHours(this.h);
    start.setMinutes(this.min);

    const end : Date = new Date(start.getTime() + (35 * 60000 * this.clients));
    const hours = end.getHours().toString().padStart(2, '0');
    const minutes = end.getMinutes().toString().padStart(2, '0');

    return `bis ${hours}:${minutes}`;
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

    const end: Date = new Date(start.getTime() + 35 * 60000 * this.clients);

    if (this.doesOverlap(start,end)) {
      return;
    }

    const body = {
      name: this.name,
      email: this.email,
      clients: this.clients,
      comment: this.comment,
      timestamp_start: start.toISOString(),
      timestamp_end: end.toISOString(),
    };

    this.home.addRequest(body).subscribe({
      next: (res : Cut) => {
        this.events.push(res);
      },
      error: (err) => {
        console.error(`Failed to request a cut:`, err);
      }
    });
  }

  doesOverlap(start: Date, end: Date): boolean {
    return this.events.some(ev => {
      return (
        ev.timestamp_start.getFullYear() === start.getFullYear() &&
        ev.timestamp_start.getMonth() === start.getMonth() &&
        ev.timestamp_start.getDate() === start.getDate() &&
        this.checkOverlap(start, end, ev.timestamp_start, ev.timestamp_end)
      );
    });
  }

  checkOverlap(startA: Date, endA: Date, startB: Date, endB: Date): boolean {
    return startA < endB && startB < endA;
  }

  refreshEvents(event: Event): void {
    event.preventDefault();
    this.getCutsData();
  }

  formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

 updateSelectedDayAfterMonthChange(): void {
    const now = new Date();
    const year = now.getFullYear();
    const month = this.currentMonthIndex;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date(now.setHours(0, 0, 0, 0));

    for (let day = 1; day <= daysInMonth; day++) {
      const candidateDate = new Date(year, month, day);
      if (candidateDate >= today) {
        const adjusted = this.skipCandidates(candidateDate);
        this.selectedDay = {
          day: adjusted.getDate(),
          monthIndex: adjusted.getMonth(),
          year: adjusted.getFullYear(),
        };
        this.getCutsData();
        return;
      }
    }
    this.selectedDay = null;
  }
}
