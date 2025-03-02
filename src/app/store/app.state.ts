import { ActionReducerMap } from '@ngrx/store';
import { characterReducer, CharacterState } from './reducers/character.reducer';

export interface AppState {
  characters: CharacterState;
}

export const reducers: ActionReducerMap<AppState> = {
  characters: characterReducer,
};
