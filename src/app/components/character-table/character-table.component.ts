import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { first, forkJoin, Observable } from 'rxjs';
import { RickAndMortyService } from 'src/app/services/rick-and-morty.service';
import { SharedDataService } from 'src/app/services/shared-data.service';
// STORE
import { Store } from '@ngrx/store';
// Importa las acciones del store
import * as CharacterActions from 'src/app/store/actions/character.actions';
import {
  selectAllCharacters,
  selectCurrentPage,
  selectPrevPageUrl,
  selectNextPageUrl,
  selectTotalPages
} from 'src/app/store/selectors/character.selectors';

@Component({
  selector: 'app-character-table',
  templateUrl: './character-table.component.html',
  styleUrls: ['./character-table.component.scss'],
})
export class CharacterTableComponent implements OnInit {
  characters$!: Observable<any>;
  currentPage$!: Observable<number>;
  prevPageUrl$!: Observable<string | null>;
  nextPageUrl$!: Observable<string | null>;
  totalPages$!: Observable<number>;// Observable para obtener los personajes desde el store
  loading$: Observable<boolean>;
  pages: number[] = [];

  // Propiedades para los filtros
  filterName: string = '';
  filterStatus: string = '';
  currentPage = 0; // Página actual
  totalPages = 0; // Total de páginas
  itemsPerPage: number = 20; // Controla la cantidad de elementos por página

  nextPageUrl: string | null = null; // URL de la siguiente página
  prevPageUrl: string | null = null; // URL de la página anterior

  hasPrevPage: boolean = false;
  hasNextPage: boolean = false;

  // pageCounter: number = 1;
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
  // dataSource: any[] = []; // Arreglo para almacenar los personajes sin REDUX

  // Propiedades para los totales
  speciesTotals: { species: string; count: number }[] = [];
  typeTotals: { type: string; count: number }[] = [];

  // Totales Globales (Todos los personajes)
  globalSpeciesTotals: { species: string; count: number }[] = [];
  globalTypeTotals: { type: string; count: number }[] = [];

  // Referencia al paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private rickAndMortyService: RickAndMortyService,
    private sharedData: SharedDataService, // Inyectar el servicio compartido
    private _liveAnnouncer: LiveAnnouncer,
    private cdr: ChangeDetectorRef, // Inyecta el ChangeDetectorRef
    private store: Store
  ) {
  }

  //// Método para cargar personajes sin REDUX
  // ngOnInit() {
  //   this.goToFirstPage(); // Cargar la primera página
  //   this.loadAllCharacters(); // Cargar todos los personajes en segundo plano para los totales
  // }

  ngOnInit() {
    this.subscribeToStore(); // llama al método para suscribirse al store y traer la data de la API
    // Disparar la acción para cargar personajes (primera página) con REDUX
    this.store.dispatch(CharacterActions.loadCharacters({ page: 1, name: '', status: '' }));
    // Cargar todos los personajes en segundo plano para los totales (sin REDUX)
    this.loadAllCharacters();
  }

  subscribeToStore() {
    // Obtener los personajes y la paginación desde el Store
    this.characters$ = this.store.select(selectAllCharacters);
    this.characters$.subscribe(characters => {
      if (characters && characters.length > 0) {
        this.dataSource = new MatTableDataSource(characters);
        this.dataSource.sort = this.sort;
        var arrAux = this.dataSource.data;
        this.calculateTotals(arrAux); // Calcular los totales iniciales

      }
    });

    this.currentPage$ = this.store.select(selectCurrentPage);
    this.currentPage$.subscribe(page => {
      if (page !== undefined) { // Asegurar que `totalPages` ya existe
        this.currentPage = page;
        this.pages = this.getVisiblePages(this.currentPage, this.totalPages);
      }
    });


    this.prevPageUrl$ = this.store.select(selectPrevPageUrl);
    this.prevPageUrl$.subscribe(prevPage => {
      this.prevPageUrl = prevPage;
      this.hasPrevPage = !!this.prevPageUrl;
    });


    this.nextPageUrl$ = this.store.select(selectNextPageUrl);
    this.nextPageUrl$.subscribe(nextPage => {
      this.nextPageUrl = nextPage;
      this.hasNextPage = !!this.nextPageUrl;
    });
    this.totalPages$ = this.store.select(selectTotalPages);


    // Actualiza el array de páginas basado en totalPages$
    this.totalPages$.subscribe(totalPages => {
      if (totalPages) {
        this.totalPages = totalPages; // Asignamos el total de páginas
        this.pages = this.getVisiblePages(this.currentPage, this.totalPages);
      }
    });
  }



  // Método para obtener las paginas visibles
  get visiblePages(): number[] {
    return this.getVisiblePages(this.currentPage, this.totalPages);
  }
  getVisiblePages(currentPage: number, totalPages: number): number[] {
    if (!currentPage || !totalPages) return []; // Evita errores si aún no están definidos
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  // Método para cargar personajes (sin REDUX)
  // loadCharacters(url: string | null = null) {
  //   if (!url) {
  //     // Codificamos los filtros para evitar problemas con caracteres especiales y espacios
  //     const nameFilter = encodeURIComponent(this.filterName.trim());
  //     const statusFilter = encodeURIComponent(this.filterStatus.trim());

  //     url = `https://rickandmortyapi.com/api/character/?page=${this.currentPage + 1}&name=${nameFilter}&status=${statusFilter}`;
  //   }

  //   this.rickAndMortyService.getCharactersByUrl(url).subscribe((data) => {
  //     if (data && data.results) {
  //       this.dataSource = data.results.slice(0, this.itemsPerPage); // Limitar la cantidad de elementos

  //       this.totalPages = data.info.pages; // Guardar total de páginas
  //       this.nextPageUrl = data.info.next || null; // Guardar URL de la siguiente página
  //       this.prevPageUrl = data.info.prev || null; // Guardar URL de la página anterior
  //       this.hasNextPage = !!this.nextPageUrl;
  //       this.hasPrevPage = !!this.prevPageUrl;

  //       // Calcular los totales por página
  //       this.calculateTotals(this.dataSource);
  //     } else {
  //       this.dataSource = [];
  //       this.totalPages = 0;
  //       this.nextPageUrl = null;
  //       this.prevPageUrl = null;
  //       this.hasNextPage = false;
  //       this.hasPrevPage = false;
  //     }
  //   });
  // }

  // Método para cargar personajes (con REDUX)
  loadCharacters() {
    this.store.dispatch(
      CharacterActions.loadCharacters({
        page: this.currentPage + 1,
        name: this.filterName.trim(),
        status: this.filterStatus.trim(),
      })
    );
  }
  // Método para cargar todos los personajes (metodo sin REDUX)
  loadAllCharacters() {
    this.rickAndMortyService.getCharacters(1, this.filterName, this.filterStatus)
      .subscribe((data) => {
        if (data && data.info) {
          const totalPages = Math.ceil(data.info.count / 20);
          let allCharacters: any[] = [];

          let requests = [];
          for (let i = 1; i <= totalPages; i++) {
            requests.push(this.rickAndMortyService.getCharacters(i, this.filterName, this.filterStatus));
          }

          forkJoin(requests).subscribe((responses) => {
            responses.forEach(response => {
              if (response.results) {
                allCharacters = [...allCharacters, ...response.results];
              }
            });

            // Calcular los totales y guardarlos en variables globales
            this.calculateGlobalTotals(allCharacters);
          });
        }
      });
  }

  calculateGlobalTotals(characters: any[]) {
    // Totales por Especie
    const speciesMap = new Map<string, number>();
    characters.forEach((character) => {
      const species = character.species;
      speciesMap.set(species, (speciesMap.get(species) || 0) + 1);
    });
    this.globalSpeciesTotals = Array.from(speciesMap.entries()).map(([species, count]) =>
      ({ species, count })
    );

    // Totales por Tipo
    const typeMap = new Map<string, number>();
    characters.forEach((character) => {
      const type = character.type || 'N/A';
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    this.globalTypeTotals = Array.from(typeMap.entries()).map(([type, count]) =>
      ({ type, count })
    );

    // Enviar los totales al servicio compartido
    this.sharedData.updateGlobalTotals({
      speciesTotals: this.globalSpeciesTotals,
      typeTotals: this.globalTypeTotals,
    });
  }
  updatePaginationState() {
    this.hasNextPage = this.nextPageUrl !== null && this.nextPageUrl !== undefined; // Determinamos si hay una página siguiente
    this.paginator.hasNextPage = () => this.hasNextPage;

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }
  // Método para aplicar orden en la listas
  announceSortChange(event: any) {
    if (event.direction) {
      this._liveAnnouncer.announce(`Ordenado en ${event.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Ordenamiento eliminado');
    }
  }

  applyFilters() {
    this.currentPage = 0; // Reiniciar la paginación
    this.nextPageUrl = null; // Reiniciar la URL de la siguiente página
    this.prevPageUrl = null; // Reiniciar la URL de la página anterior

    this.loadCharacters(); // Cargar la primera página con los filtros aplicados
  }
  // Método para seleccionar un personaje
  selectCharacter(character: any) {
    this.sharedData.changeCharacterId(character.id); // Actualizar el ID del personaje seleccionado
  }

  // Método para calcular los totales
  calculateTotals(characters: any[]) {
    // Calcular totales por species
    const speciesMap = new Map<string, number>();
    characters.forEach((character) => {
      const species = character.species;
      speciesMap.set(species, (speciesMap.get(species) || 0) + 1);
    });
    this.speciesTotals = Array.from(speciesMap.entries()).map(([species, count]) =>
      ({ species, count })
    );

    // Calcular totales por type
    const typeMap = new Map<string, number>();
    characters.forEach((character) => {
      const type = character.type || 'N/A'; // Si no tiene tipo, le asignamos 'N/A'
      typeMap.set(type, (typeMap.get(type) || 0) + 1);
    });
    this.typeTotals = Array.from(typeMap.entries()).map(([type, count]) =>
      ({ type, count })
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

  // Método para ir a la primera página (sin REDUX)
  // goToFirstPage() {
  //   this.currentPage = 1;
  //   this.loadCharacters(`https://rickandmortyapi.com/api/character/?page=1&name=${this.filterName}&status=${this.filterStatus}`);
  // }
  // Método para ir a la página anterior (con REDUX)
  goToFirstPage() {
    this.store.dispatch(CharacterActions.loadCharacters({ page: 1, name: '', status: '' }));
  }

  // Método para ir a la página anterior (sin REDUX)
  // goToPreviousPage() {
  //   if (this.prevPageUrl) {
  //     this.currentPage--;
  //     this.loadCharacters(this.prevPageUrl);
  //   }
  // }

  // Método para ir a la página anterior (con REDUX)
  goToPreviousPage() {
    this.prevPageUrl$.pipe(first()).subscribe(prevPage => {
      if (prevPage) {
        this.store.dispatch(CharacterActions.loadCharacters({ page: this.getPageFromUrl(prevPage), name: '', status: '' }));
      }
    });
  }

  // Método para ir a una página específica (sin REDUX)
  // goToPage(page: number) {
  //   this.currentPage = page;
  //   this.loadCharacters(`https://rickandmortyapi.com/api/character/?page=${page}&name=${this.filterName}&status=${this.filterStatus}`);
  // }

  // Método para ir a una página específica (con REDUX)
  goToPage(page: number) {
    this.store.dispatch(CharacterActions.loadCharacters({ page, name: '', status: '' }));
  }

  // Método para ir a la página siguiente (sin REDUX)
  // goToNextPage() {
  //   if (this.nextPageUrl) {
  //     this.currentPage++;
  //     this.loadCharacters(this.nextPageUrl);
  //   }
  // }

  // Método para ir a la página siguiente (con REDUX)
  goToNextPage() {
    this.nextPageUrl$.pipe(first()).subscribe(nextPage => {
      if (nextPage) {
        this.store.dispatch(CharacterActions.loadCharacters({ page: this.getPageFromUrl(nextPage), name: '', status: '' }));
      }
    });
  }
  // Método para ir a la última página (sin REDUX)
  // goToLastPage() {
  //   this.currentPage = this.totalPages; // Ir a la última página y setear el current en la misma 
  //   this.loadCharacters(`https://rickandmortyapi.com/api/character/?page=${this.totalPages}&name=${this.filterName}&status=${this.filterStatus}`);
  // }

  // Método para ir a la última página (con REDUX)
  goToLastPage() {
    this.totalPages$.subscribe(totalPages => {
      this.store.dispatch(CharacterActions.loadCharacters({ page: totalPages, name: '', status: '' }));
    });
  }
  // Método para obtener los números de página a mostrar (con REDUX)
  private getPageFromUrl(url: string): number {
    const match = url.match(/page=(\d+)/);
    return match ? parseInt(match[1], 10) : 1;
  }
  // Método para obtener los números de página a mostrar (sin REDUX)
  // getPageNumbers(): number[] {
  //   const pages: number[] = []; // Arreglo para almacenar los números de página
  //   const startPage = Math.max(1, this.currentPage - 2); // Página inicial
  //   const endPage = Math.min(this.totalPages, this.currentPage + 2); // Página final

  //   for (let i = startPage; i <= endPage; i++) {// Generar números de página
  //     pages.push(i);
  //   }

  //   return pages;
  // }
}
