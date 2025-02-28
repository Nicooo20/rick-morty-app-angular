import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private characterIdSource = new BehaviorSubject<number | null>(null);
  currentCharacterId = this.characterIdSource.asObservable();

  private favoriteCharacterSource = new BehaviorSubject<any>(null);
  currentFavoriteCharacter = this.favoriteCharacterSource.asObservable();

  private totalsSource = new BehaviorSubject<{ speciesTotals: { species: string; count: number }[]; typeTotals: { type: string; count: number }[];}>({ speciesTotals: [], typeTotals: [] });
  
  currentTotals = this.totalsSource.asObservable();

  // Método para actualizar el ID del personaje seleccionado
  changeCharacterId(characterId: number) {
    this.characterIdSource.next(characterId);
  }

    // Método para actualizar el personaje favorito
    setFavoriteCharacter(character: any) {
      this.favoriteCharacterSource.next(character);
    }

   // Método para actualizar los totales
  updateTotals(totals: {
    speciesTotals: { species: string; count: number }[];
    typeTotals: { type: string; count: number }[];
  }) {
    this.totalsSource.next(totals);
  }
}
