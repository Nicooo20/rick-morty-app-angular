import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { RickAndMortyService } from 'src/app/services/rick-and-morty.service';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-character-table',
  templateUrl: './character-table.component.html',
  styleUrls: ['./character-table.component.scss'],
})
export class CharacterTableComponent {
  // Propiedades para los filtros
  filterName: string = '';
  filterStatus: string = '';

  // Propiedades para la tabla
  displayedColumns: string[] = [
    'name',
    'status',
    'species',
    'type',
    'gender',
    'created',
    'actions',
  ];
  dataSource = new MatTableDataSource<any>([]);

  // Propiedades para los totales
  speciesTotals: { species: string; count: number }[] = [];
  typeTotals: { type: string; count: number }[] = [];

  // Referencia al paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private rickAndMortyService: RickAndMortyService,
    private sharedData: SharedDataService, // Inyectar el servicio compartido
    private _liveAnnouncer: LiveAnnouncer
  ) {}

  ngOnInit() {
    this.loadCharacters(); // Cargar personajes al iniciar
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  // Método para cargar personajes
  loadCharacters(page: number = 1) {
    this.rickAndMortyService.getCharacters(page, this.filterName, this.filterStatus)
    .subscribe((data) => {
      if (data && data.results) {
        this.dataSource.data = data.results;
        this.paginator.length = data.info.count;
      } else {
        this.dataSource.data = [];
      }
      this.calculateTotals(this.dataSource.data);
    });
  }
  onPageChange(event: any) {
    let pageIndex = event.pageIndex + 1; // La API usa índice basado en 1
    this.loadCharacters(pageIndex);
  }

  announceSortChange(event: any) {
    console.log('Evento de ordenamiento:', event); // Verifica qué datos está recibiendo
    if (event.direction) {
      this._liveAnnouncer.announce(`Ordenado en ${event.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Ordenamiento eliminado');
    }
  }

  // Método para aplicar filtros
  applyFilters() {
    this.loadCharacters(); // Recargar personajes con los filtros aplicados
  }

  // Método para seleccionar un personaje
  selectCharacter(character: any) {
    this.sharedData.changeCharacterId(character.id); // Actualizar el ID del personaje seleccionado
  }

   // Método para calcular los totales
  calculateTotals(characters: any[]) {
    console.log(characters);
    
    // Calcular totales por species
    const speciesMap = new Map<string, number>();
      characters.forEach((character) => {
        const species = character.species;
        speciesMap.set(species, (speciesMap.get(species) || 0) + 1);
      });
      this.speciesTotals = Array.from(speciesMap.entries()).map(([species, count]) => 
        ({ species, count})
      );

    // Calcular totales por type
    const typeMap = new Map<string, number>();
    characters.forEach((character) => {
      const type = character.type || 'N/A'; // Si no tiene tipo, le asignamos 'N/A'
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    this.typeTotals = Array.from(typeMap.entries()).map(([type, count]) => 
      ({type, count})
    );

    // Enviar los totales al servicio compartido
    this.sharedData.updateTotals({
      speciesTotals: this.speciesTotals,
      typeTotals: this.typeTotals,
    });
  }

    // Método para marcar un personaje como favorito
    markAsFavorite(character: any) {
      this.sharedData.setFavoriteCharacter(character); // Enviar el personaje favorito al servicio
    }
}
