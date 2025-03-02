import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as CharacterActions from '../actions/character.actions';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { RickAndMortyService } from 'src/app/services/rick-and-morty.service';

@Injectable()
export class CharacterEffects {
    constructor(
        private actions$: Actions,
        private characterService: RickAndMortyService
    ) { }

    // Effect para cargar personajes con filtros opcionales
    loadCharacters$ = createEffect(() =>
        this.actions$.pipe(
            ofType(CharacterActions.loadCharacters),
            mergeMap(({ page, name, status }) =>
                this.characterService.getCharacters(page, name, status).pipe(
                    map(data => {
                        // Calculamos la página actual
                        let currentPage = 1; // Por defecto, si no hay prev, estamos en la primera página
                        if (data.info.prev) { 
                            currentPage = this.getPageFromUrl(data.info.prev) + 1;
                        } else if (data.info.next) {
                            currentPage = this.getPageFromUrl(data.info.next) - 1;
                        }

                        return CharacterActions.loadCharactersSuccess({
                            characters: data.results,
                            currentPage,
                            prevPageUrl: data.info.prev,
                            nextPageUrl: data.info.next,
                            totalPages: data.info.pages
                        });
                    }),
                    catchError(error => of(CharacterActions.loadCharactersFailure({ error: error.message })))
                )
            )
        )
    );

    //Metodo para obtener el número de página desde la URL
    private getPageFromUrl(url: string): number {
        const match = url ? url.match(/page=(\d+)/) : null;
        return match ? parseInt(match[1], 10) : 1;
    }
}