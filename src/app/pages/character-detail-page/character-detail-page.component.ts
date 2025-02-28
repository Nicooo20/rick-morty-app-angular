import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RickAndMortyService } from 'src/app/services/rick-and-morty.service';

@Component({
  selector: 'app-character-detail-page',
  templateUrl: './character-detail-page.component.html',
  styleUrls: ['./character-detail-page.component.scss']
})
export class CharacterDetailPageComponent implements OnInit {
  character: any = null; // Personaje seleccionado

  constructor(
    private route: ActivatedRoute, // Para obtener el ID de la URL
    private rickAndMortyService: RickAndMortyService, // Para obtener los detalles del personaje
  ) {}

  ngOnInit() {
    // Obtener el ID del personaje desde la URL
    const characterId = this.route.snapshot.paramMap.get('id');

    if (characterId) {
      // Cargar los detalles del personaje
      this.rickAndMortyService.getCharacterById(+characterId).subscribe((data) => {
        this.character = data;
      });
    }
  }

}
