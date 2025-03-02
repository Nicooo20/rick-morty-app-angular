export interface Character {
    id: number;
    name: string;
    status: 'Alive' | 'Dead' | 'unknown';
    species: string;
    type: string;
    gender: 'Male' | 'Female' | 'Genderless' | 'unknown';
    origin: {
        name: string;
        url: string;
    };
    location: {
        name: string;
        url: string;
    };
    image: string;
    episode: string[];  // Lista de episodios en los que aparece
    created: string; // Fecha de creación en la API
}
