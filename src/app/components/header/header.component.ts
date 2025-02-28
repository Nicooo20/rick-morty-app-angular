import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/services/shared-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  favoriteCharacter: any = null; // Personaje favorito

  constructor(private sharedData: SharedDataService) {}

  ngOnInit() {
    // Suscribirse al servicio para recibir el personaje favorito
    this.sharedData.currentFavoriteCharacter.subscribe((character) => {
      this.favoriteCharacter = character;
    });
  }

  // Método para mostrar los detalles del personaje favorito
  showFavoriteDetails() {
    if (this.favoriteCharacter) {
      this.sharedData.changeCharacterId(this.favoriteCharacter.id); // Enviar el ID del personaje favorito
    }
  }
}
