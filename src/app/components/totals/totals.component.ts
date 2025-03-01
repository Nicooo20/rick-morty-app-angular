import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-totals',
  templateUrl: './totals.component.html',
  styleUrls: ['./totals.component.scss']
})
export class TotalsComponent implements OnInit {

  speciesTotals: { species: string; count: number }[] = [];
  typeTotals: { type: string; count: number }[] = [];
  // Totales Globales (Todos los personajes)
  globalSpeciesTotals: { species: string; count: number }[] = [];
  globalTypeTotals: { type: string; count: number }[] = [];

  constructor(private sharedData: SharedDataService) {}

  ngOnInit() {
    // Suscribirse al servicio para recibir los totales
    this.sharedData.currentTotals.subscribe((totals) => {
      this.speciesTotals = totals.speciesTotals.sort((a, b) => a.species.localeCompare(b.species)); //aplicamos sort para ordenar alfabeticamente
      this.typeTotals = totals.typeTotals.sort((a, b) => a.type.localeCompare(b.type)); //aplicamos sort para ordenar alfabeticamente
    });

    // Suscribirse al servicio para recibir los totales globales
    this.sharedData.globalTotals.subscribe((totals) => {
      this.globalSpeciesTotals = totals.speciesTotals.sort((a, b) => a.species.localeCompare(b.species)); //aplicamos sort para ordenar alfabeticamente
      this.globalTypeTotals = totals.typeTotals.sort((a, b) => a.type.localeCompare(b.type)); //aplicamos sort para ordenar alfabeticamente
    });
  }
}
