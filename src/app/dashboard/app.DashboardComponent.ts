import { Component, OnInit } from "@angular/core";
import { AuthService } from "../login/app.AuthService";
import { DashboardService } from "./app.DashboardService";
import { CommonModule } from "@angular/common";
import { Cut } from "../home/app.EventInterface";

@Component({
  selector: 'app-dashboard-component',
  templateUrl: 'app.DashboardComponent.html',
  styleUrl: 'app.DashboardComponent.css',
  imports: [CommonModule]
})

export class DashboardComponent implements OnInit{
  constructor(private dashboardService: DashboardService){}


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

  dayStatusMap = new Map<string, Set<number>>();
  weekdays : string[] = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

  minMonthIndex : number = 0;
  maxMonthIndex : number = this.months.length - 1;
  currentMonthIndex : number= this.minMonthIndex;

  selectedDay: { monthIndex: number; day: number; year: number } | null = null;
  events : Cut[] = [
    {id: 1, timestamp_start: new Date(), timestamp_end: new Date(), clients: 1, name: 'Someone', state: 0},
    {id: 2, timestamp_start: new Date(), timestamp_end: new Date(2025,8,1), clients: 1, name: 'Someone', state: 1},
    {id: 3, timestamp_start: new Date(), timestamp_end: new Date(2025,8,2), clients: 1, name: 'Someone', state: 0},
    {id: 4, timestamp_start: new Date(), timestamp_end: new Date(2025,8,2), clients: 1, name: 'Someone', state: 1},
  ];

  ngOnInit(): void {
    const today : Date = new Date();
    this.minMonthIndex  = today.getMonth();
    this.currentMonthIndex = this.minMonthIndex;

    this.months[1].days = this.isLeapYear(today.getFullYear()) ? 29: 28;
    this.selectedDay = { monthIndex: this.currentMonthIndex, day: today.getDate(), year: today.getFullYear() };

    this.updateDayStatusMap();
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

  isPastDay(monthIndex: number, day: number): boolean {
    const today = new Date();
    const currentDate = new Date(today.getFullYear(), monthIndex, day);
    return currentDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  }

  onReject(event: Event, id : number) : void {
    event.preventDefault();

    this.dashboardService.rejectRequest(id).subscribe(
      (next : any) => {
        console.log('Request rejected');
      },
      () => {
        console.error('error rejecting');
      }
    )
  }

  onAccept(event: Event, id : number) : void {
    event.preventDefault();

    this.dashboardService.acceptRequest(id).subscribe(
      (next : any) => {
        console.log('Request accepted');
      },
      () => {
        console.error('error accepting');
      }
    )
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

  updateDayStatusMap() {
    this.dayStatusMap.clear();

    this.events.forEach(event => {
      const key = `${event.timestamp_start.getMonth()}-${event.timestamp_start.getDate()}`;
      if (!this.dayStatusMap.has(key)) {
        this.dayStatusMap.set(key, new Set());
      }
      this.dayStatusMap.get(key)!.add(event.state);
    });
  }

  getDayStatus(month: number, day: number): Set<number> | undefined {
    return this.dayStatusMap.get(`${month}-${day}`);
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


