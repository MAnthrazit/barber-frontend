import { Component, OnInit } from "@angular/core";
import { AuthService } from "../login/app.AuthService";
import { DashboardService } from "./app.DashboardService";

@Component({
  selector: 'app-dashboard-component',
  templateUrl: 'app.DashboardComponent.html',
  styleUrl: 'app.DashboardComponent.css'
})

export class DashboardComponent implements OnInit{
  constructor(private auth: AuthService, private dashboardService: DashboardService){}

  selectedDays : Set<Date>  = new Set<Date>();


  ngOnInit(): void {
      return;
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

    this.dashboardService.insertHoliday(Array.of(this.selectedDays)).subscribe(
      (dates : Date[]) => {
        console.log('days add');
      },
      () => {
        console.error('days rejected');
      }
    );
  }

  onDeleteHolidays(event : Event){
    event.preventDefault();

    this.dashboardService.deleteHoliday(Array.of(this.selectedDays)).subscribe(
      (dates: Date[]) => {
        console.log('holidays deleted');
      },
      () => {
        console.error('error deleting holidays');
      }
    )
  }
}


