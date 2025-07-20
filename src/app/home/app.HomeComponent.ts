import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { AuthService } from "../login/app.AuthService";
import { HomeService } from "./app.HomeService";
import { Cut } from "./app.EventInterface";

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
  h : number = 0;
  min : number = 0;

  events : Cut[] = [
    { id: 0, date: new Date(2025, 6, 21, 16, 0), name: 'A' },
    { id: 0, date: new Date(2025, 6, 21, 14, 0), name: 'B' },
    { id: 0, date: new Date(2025, 6, 20, 9, 0),  name: 'C' },
  ];

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
        e.date.getFullYear() === new Date().getFullYear() &&
          e.date.getMonth() === this.selectedDay!.monthIndex &&
          e.date.getDate() === this.selectedDay!.day
      );
    });

    return eventsForDay.sort((a, b) => a.date.getTime() - b.date.getTime());
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

    const end : Date = new Date(start.getTime() + 35 * 60000);

    const conflicts : boolean= this.events.some(ev => {
      return (
        ev.date.getFullYear() === start.getFullYear() &&
        ev.date.getMonth() === start.getMonth() &&
        ev.date.getDate() === start.getDate() &&
        this.doesOverlap(start, end, ev.date, new Date(ev.date.getTime() + 35 * 60000))
      );
    });

    if (conflicts) {
      alert("Nope");
      return;
    }


    const form : FormData = new FormData();
    form.append('name', this.name);
    form.append('email', this.email);
    form.append('timestamp', this.selectedDay?.year + '-' + this.selectedDay?.monthIndex + '-' + this.selectedDay?.day + ":" + this.h + '-' + this.min);

    this.home.addRequest(form).subscribe(
      (res: Cut) => {
        this.events.push({
          id: res.id,
          name: 'Haarschnitt',
          date: start,
        });
      },
      (error) => {
        console.error("Request denied")
      }
    )
  }

  refreshEvents(event: Event) : void {
    event

    this.home.getRequest().subscribe(
      (res: Cut[]) => {
        this.events = res;
      },
      (error) => {
        console.error('Could not fetch events');
      }
    )
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
