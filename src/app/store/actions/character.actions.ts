
import { createAction, props } from '@ngrx/store';
import { Character } from '../../models/character.model';

// Acción para iniciar la carga de personajes con filtros opcionales
export const loadCharacters = createAction(
    'Cargar Personajes',
    props<{ page: number; name?: string; status?: string }>()
);
// Acción cuando la carga de personajes es exitosa
export const loadCharactersSuccess = createAction(
    'Personajes cargados con éxito',
    props<{
        characters: Character[],
        currentPage: number,
        prevPageUrl: string | null,
        nextPageUrl: string | null,
        totalPages: number
    }>()
);

// Acción cuando la carga de personajes falla
export const loadCharactersFailure = createAction(
    'Error al cargar personajes',
    props<{ error: any }>()
);

// Acción para seleccionar un personaje
export const selectCharacter = createAction(
    'Seleccionar Personaje',
    props<{ character: Character }>()
);
