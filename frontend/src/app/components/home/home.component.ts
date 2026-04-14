import { Component, OnInit, ViewChild } from '@angular/core';
import { Kpi } from 'src/app/models/models';
import { DataService } from 'src/app/services/api.service';
import { KanbanBoardComponent } from '../../kanban-board.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  kpis: Kpi[] = [];
  expandedKpis: Set<string> = new Set();
  @ViewChild(KanbanBoardComponent) kanbanBoard!: KanbanBoardComponent;

  // El servicio ahora se inyecta aquí
  constructor(private dataService: DataService) { }

  ngOnInit() {
    this.dataService.getKpis().subscribe(data => {
      this.kpis = data;
    });
  }

  toggleKpi(titulo: string) {
    if (this.expandedKpis.has(titulo)) {
      this.expandedKpis.delete(titulo);
    } else {
      this.expandedKpis.add(titulo);
    }
  }

  isKpiExpanded(titulo: string): boolean {
    return this.expandedKpis.has(titulo);
  }

  abrirModal() {
    if (this.kanbanBoard) {
      this.kanbanBoard.abrirModalTrato();
    }
  }

}
