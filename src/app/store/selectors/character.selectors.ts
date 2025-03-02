import { createSelector, createFeatureSelector } from '@ngrx/store';
import { CharacterState } from '../reducers/character.reducer';

// Obtiene el estado de personajes
export const selectCharacterState = createFeatureSelector<CharacterState>('characters');

// Obtiene la lista de personajes
export const selectAllCharacters = createSelector(
    selectCharacterState,
    (state) => state.characters
);

// Obtiene la página actual
export const selectCurrentPage = createSelector(
    selectCharacterState,
    (state) => state.currentPage
);

// Obtiene la URL de la página anterior
export const selectPrevPageUrl = createSelector(
    selectCharacterState,
    (state) => state.prevPageUrl
);

// Obtiene la URL de la página siguiente
export const selectNextPageUrl = createSelector(
    selectCharacterState,
    (state) => state.nextPageUrl
);

// Obtiene el número total de páginas
export const selectTotalPages = createSelector(
    selectCharacterState,
    (state) => state.totalPages
);
