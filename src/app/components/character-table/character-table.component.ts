import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { forkJoin } from 'rxjs';
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
  totalCharacters = 0; // Total de personajes
  pageSize = 10; // Tamaño de página por defecto
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
  // dataSource = new MatTableDataSource<any>([]);
  dataSource: any[] = [];

  // Propiedades para los totales
  speciesTotals: { species: string; count: number }[] = [];
  typeTotals: { type: string; count: number }[] = [];

  // Totales Globales (Todos los personajes)
  globalSpeciesTotals: { species: string; count: number }[] = [];
  globalTypeTotals: { type: string; count: number }[] = [];

  // Referencia al paginador
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private rickAndMortyService: RickAndMortyService,
    private sharedData: SharedDataService, // Inyectar el servicio compartido
    private _liveAnnouncer: LiveAnnouncer,
    private cdr: ChangeDetectorRef // Inyecta el ChangeDetectorRef
  ) { }

  ngOnInit() {
    // this.loadCharacters(); // Cargar personajes para la primera página
    this.goToFirstPage(); // Cargar la primera página
    this.loadAllCharacters(); // Cargar todos los personajes en segundo plano para los totales
  }

  // ngAfterViewInit() {
  //   console.log('dataSource', this.dataSource.paginator.pageIndex);
  //   // console.log('paginador', this.paginator.pageIndex);
  //   setTimeout(() => {
  //     this.dataSource.sort = this.sort;
  //     this.dataSource.paginator = this.paginator;
  //   });
  // }

  // Método para cargar personajes
  // loadCharacters(url: string | null = null) {
  //   console.log(url);
  //   if (!url) {
  //     url = `https://rickandmortyapi.com/api/character/?name=${this.filterName}&status=${this.filterStatus}`;
  //   }

  //   this.rickAndMortyService.getCharactersByUrl(url).subscribe((data) => {
  //     if (data && data.results) {
  //       console.log(data);
  //       this.dataSource.data = data.results;
  //       this.paginator.length = data.info.count;
  //       this.pageCounter =this.paginator.pageIndex ;
  //       this.nextPageUrl = data.info.next || null;
  //       this.prevPageUrl = data.info.prev || null;

  //       this.updatePaginationState(); //Para actualizar los botones de paginación.

  //       //Asegurar que el cambio se detecte
  //       setTimeout(() => {
  //         this.cdr.detectChanges();
  //       });
  //     } else {
  //       this.dataSource.data = [];
  //       this.nextPageUrl = null;
  //       this.prevPageUrl = null;
  //     }
  //     this.calculateTotals(this.dataSource.data);
  //   });
  // }
  // Método para cargar personajes
  loadCharacters(url: string | null = null) {
    if (!url) {
      // Codificamos los filtros para evitar problemas con caracteres especiales y espacios
      const nameFilter = encodeURIComponent(this.filterName.trim());
      const statusFilter = encodeURIComponent(this.filterStatus.trim());
  
      url = `https://rickandmortyapi.com/api/character/?page=${this.currentPage + 1}&name=${nameFilter}&status=${statusFilter}`;
    }
  
    this.rickAndMortyService.getCharactersByUrl(url).subscribe((data) => {
      if (data && data.results) {
        this.dataSource = data.results.slice(0, this.itemsPerPage); // Limitar la cantidad de elementos
  
        this.totalPages = data.info.pages; // Guardar total de páginas
        this.nextPageUrl = data.info.next || null; // Guardar URL de la siguiente página
        this.prevPageUrl = data.info.prev || null; // Guardar URL de la página anterior
        this.hasNextPage = !!this.nextPageUrl;
        this.hasPrevPage = !!this.prevPageUrl;
  
        // Calcular los totales por página
        this.calculateTotals(this.dataSource);
      } else {
        this.dataSource = [];
        this.totalPages = 0;
        this.nextPageUrl = null;
        this.prevPageUrl = null;
        this.hasNextPage = false;
        this.hasPrevPage = false;
      }
    });
  }


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

  // onPageChange(event: PageEvent) {
  //   if (this.currentPage === event.pageIndex) {
  //     event.pageIndex = event.pageIndex + 1;
  //   }
  //   this.currentPage = event.pageIndex; // Actualiza la página actual solo si es distinta
  //   const nextPage = this.currentPage + 1; // API usa índice base 1
  //   this.loadCharacters(`https://rickandmortyapi.com/api/character/?page=${nextPage}&name=${this.filterName}&status=${this.filterStatus}`);
  // }

  updatePaginationState() {
    this.hasNextPage = this.nextPageUrl !== null && this.nextPageUrl !== undefined; // Determinamos si hay una página siguiente
    this.paginator.hasNextPage = () => this.hasNextPage;

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 100);
  }

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

  // Método para ir a la primera página
  goToFirstPage() {
    this.currentPage = 1;
    this.loadCharacters(`https://rickandmortyapi.com/api/character/?page=1&name=${this.filterName}&status=${this.filterStatus}`);
  }

  // Método para ir a la página anterior
  goToPreviousPage() {
    if (this.prevPageUrl) {
      this.currentPage--;
      this.loadCharacters(this.prevPageUrl);
    }
  }

  // Método para ir a una página específica
  goToPage(page: number) {
    this.currentPage = page;
    this.loadCharacters(`https://rickandmortyapi.com/api/character/?page=${page}&name=${this.filterName}&status=${this.filterStatus}`);
  }

  // Método para ir a la página siguiente
  goToNextPage() {
    if (this.nextPageUrl) {
      this.currentPage++;
      this.loadCharacters(this.nextPageUrl);
    }
  }

  // Método para ir a la última página
  goToLastPage() {
    this.currentPage = this.totalPages; // Ir a la última página y setear el current en la misma 
    this.loadCharacters(`https://rickandmortyapi.com/api/character/?page=${this.totalPages}&name=${this.filterName}&status=${this.filterStatus}`);
  }

  // Método para obtener los números de página a mostrar
  getPageNumbers(): number[] {
    const pages: number[] = []; // Arreglo para almacenar los números de página
    const startPage = Math.max(1, this.currentPage - 2); // Página inicial
    const endPage = Math.min(this.totalPages, this.currentPage + 2); // Página final

    for (let i = startPage; i <= endPage; i++) {// Generar números de página
      pages.push(i);
    }

    return pages;
  }
}
