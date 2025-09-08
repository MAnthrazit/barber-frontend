import { Component } from "@angular/core";
import { OnInit } from "@angular/core";
import { Cut } from "../home/app.EventInterface";
import { CommonModule, formatDate } from "@angular/common";
import { DashboardService } from "../dashboard/app.DashboardService";


@Component({
  selector: 'app-holiday-component',
  templateUrl: 'app.HolidayComponent.html',
  styleUrl: 'app.HolidayComponent.css',
  imports: [CommonModule]
})

export class HolidayComponent implements OnInit{
  constructor(private dashboarService : DashboardService){};

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

  minMonthIndex : number = 0;
  maxMonthIndex : number = this.months.length - 1;
  currentMonthIndex : number= this.minMonthIndex;


  selectedDay: { monthIndex: number; day: number; year: number } | null = null;
  pointerOne: { monthIndex: number; day: number; year: number } | null = null;
  pointerTwo: { monthIndex: number; day: number; year: number } | null = null;

  events : Cut[] = [];

  ngOnInit(): void {
      const today : Date = new Date();
      this.minMonthIndex = today.getMonth();
      this.currentMonthIndex = this.minMonthIndex;


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
    const firstDay = new Date(year, monthIndex, 1).getDay();
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
    }
  }

  nextMonth(): void {
    if (!this.isAtMaxMonth) {
      this.currentMonthIndex++;
    }
  }

  isPointer(monthIndex: number, day: number): boolean {
    const first : boolean = (this.pointerOne?.monthIndex === monthIndex) && (this.pointerOne?.day === day);
    const second : boolean= (this.pointerTwo?.monthIndex === monthIndex) && (this.pointerTwo?.day === day);
    return first || second;
  }

  isBetween(monthIndex: number, day: number): boolean {
    if (!this.pointerOne || !this.pointerTwo) return false;

    const year = this.pointerOne.year;
    const currentDate = new Date(year, monthIndex, day);
    const startDate = new Date(
      year,
      this.pointerOne.monthIndex,
      this.pointerOne.day
    );
    const endDate = new Date(
      year,
      this.pointerTwo.monthIndex,
      this.pointerTwo.day
    );

    return currentDate > startDate && currentDate < endDate;
  }

  isPastDay(monthIndex: number, day: number): boolean {
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), monthIndex, day);
    return currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  formatPointer(selector: string) {
    if (selector === "start") {
      if (!this.pointerOne) {
        return "../../....";
      } else {
        return this.formatDate(
          this.pointerOne.day,
          this.pointerOne.monthIndex,
          this.pointerOne.year
        );
      }
    }
    if (selector === "end") {
      if (!this.pointerTwo) {
        return "../../....";
      } else {
        return this.formatDate(
          this.pointerTwo.day,
          this.pointerTwo.monthIndex,
          this.pointerTwo.year
        );
      }
    }
    return "../../....";
  }

  formatDate(day: number, month: number, year: number): string {
    const selectedDay = day.toString().padStart(2, "0");
    const selectedMonth = (month + 1).toString().padStart(2, "0");
    const selectedYear = year.toString();
    return `${selectedDay}/${selectedMonth}/${selectedYear}`;
  }

  compareDates(
    a: { year: number; monthIndex: number; day: number },
    b: { year: number; monthIndex: number; day: number }
  ): number {
    const dateA = new Date(a.year, a.monthIndex, a.day);
    const dateB = new Date(b.year, b.monthIndex, b.day);
    return dateA.getTime() - dateB.getTime();
  }

  togglePointer(monthIndex: number, day: number): void {
    if (this.isPastDay(monthIndex, day)) return;

    const today: Date = new Date();
    const clickedDate = { monthIndex, day, year: today.getFullYear() };

    if (!this.pointerOne || (this.pointerOne && this.pointerTwo)) {
      this.pointerOne = clickedDate;
      this.pointerTwo = null;
    } else if (!this.pointerTwo) {
      if (this.compareDates(clickedDate, this.pointerOne) < 0) {
        this.pointerTwo = this.pointerOne;
        this.pointerOne = clickedDate;
      } else {
        this.pointerTwo = clickedDate;
      }
    }

    this.selectedDay = clickedDate;
  }

  planHoliday(event : Event) {
    event.preventDefault();
    if (!this.pointerOne || !this.pointerTwo) return;

    const yearOne = this.pointerOne?.year!;
    const monthOne = String(this.pointerOne?.monthIndex!).padStart(2, '0');
    const dayOne = String(this.pointerOne?.day!).padStart(2, '0');

    const yearTwo = this.pointerTwo?.year!;
    const monthTwo = String(this.pointerTwo?.monthIndex!).padStart(2, '0');
    const dayTwo = String(this.pointerTwo?.day!).padStart(2, '0');


    const data = {
      start: `${yearOne}-${monthOne}-${dayOne}`,
      end: `${yearTwo}-${monthTwo}-${dayTwo}`
    }

    this.dashboarService.insertHoliday(data).subscribe(
      (res : any) => {
        console.log("...");
      },
      (error) => {
        console.error("somting went worng", error);
      }
    );
  }
}
