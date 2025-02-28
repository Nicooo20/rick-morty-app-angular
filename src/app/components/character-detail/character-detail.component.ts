import { Component, OnInit } from '@angular/core';
import { RickAndMortyService } from 'src/app/services/rick-and-morty.service';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-character-detail',
  templateUrl: './character-detail.component.html',
  styleUrls: ['./character-detail.component.scss']
})
export class CharacterDetailComponent implements OnInit {
  character: any = null;
  originResident: string | null = null;
  locationResident: string | null = null;

  constructor(
    private sharedData: SharedDataService,
    private rickAndMortyService: RickAndMortyService
  ) {}

  ngOnInit() {
    // Obtenemos el ID del personaje seleccionado y cargamos sus detalles
    this.sharedData.currentCharacterId.subscribe((characterId) => {
      if (characterId) {
        this.fetchCharacterDetails(characterId);
      }
    });
  }

  //Obtiene los detalles del personaje y la información adicional requerida.
  fetchCharacterDetails(characterId: number) {
    this.rickAndMortyService.getCharacterById(characterId).subscribe((data) => {
      this.character = data;

      // Obtener un residente del origen (si tiene origen)
      if (this.character.origin?.url) {
        this.fetchResident(this.character.origin.url, 'origin');
      } else {
        this.originResident = 'No tiene residentes';
      }

      // Obtener un residente de la ubicación actual (si tiene ubicación)
      if (this.character.location?.url) {
        this.fetchResident(this.character.location.url, 'location');
      } else {
        this.locationResident = 'No tiene residentes';
      }

      // Obtener un solo episodio si tiene
      if (this.character.episode.length > 0) {
        const episodeId = this.character.episode[0].split('/').pop();
        this.rickAndMortyService.getEpisodeById(episodeId).subscribe((episodeData) => {
          this.character.firstEpisode = episodeData;
        });
      } else {
        this.character.firstEpisode = null;
      }
    });
  }

  //Obtenemos el residente de una localización dada (origen o ubicación actual).
  fetchResident(locationUrl: string, type: 'origin' | 'location') {
    this.rickAndMortyService.getLocationByUrl(locationUrl).subscribe((locationData) => {
      const residents = locationData.residents;
      if (residents.length > 0) {
        const firstResidentId = residents[0].split('/').pop();
        this.rickAndMortyService.getCharacterById(firstResidentId).subscribe((residentData) => {
          if (type === 'origin') {
            this.originResident = residentData.name;
          } else {
            this.locationResident = residentData.name;
          }
        });
      } else {
        if (type === 'origin') {
          this.originResident = 'No tiene residentes';
        } else {
          this.locationResident = 'No tiene residentes';
        }
      }
    });
  }
}
