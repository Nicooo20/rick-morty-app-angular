import { createReducer, on } from '@ngrx/store';
import * as CharacterActions from '../actions/character.actions';

export interface CharacterState {
    characters: any[];
    currentPage: number;
    prevPageUrl: string | null;
    nextPageUrl: string | null;
    totalPages: number;
    error: string | null;
}

const initialState: CharacterState = {
    characters: [],
    currentPage: 1,
    prevPageUrl: null,
    nextPageUrl: null,
    totalPages: 1,
    error: null
};

export const characterReducer = createReducer( //Se crea el reducer para el estado de personajes
    initialState,
    on(CharacterActions.loadCharactersSuccess, (state, { characters, currentPage, prevPageUrl, nextPageUrl, totalPages }) => ({
        ...state,
        characters,
        currentPage,
        prevPageUrl,
        nextPageUrl,
        totalPages,
        error: null
    })),
    on(CharacterActions.loadCharactersFailure, (state, { error }) => ({
        ...state,
        error
    }))
);
