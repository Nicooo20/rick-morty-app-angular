import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RickAndMortyService {

  private apiUrl = environment.apiUrl; // URL de la API

  constructor(private http: HttpClient) { }

   // Obtener personajes con filtros opcionales
  getCharacters(page: number , name: string = '', status: string = ''): Observable<any> {
    const url = `${this.apiUrl}/character?page=${page}&name=${name}&status=${status}`;
    return this.http.get(url);
  }

  // Obtener un personaje por ID
  getCharacterById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/character/${id}`);
  }

  // Filtrar personajes por nombre y estado
  filterCharacters(name: string, status: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/character/?name=${name}&status=${status}`);
  }

  getEpisodeById(episodeId: string) {
    return this.http.get<any>(`https://rickandmortyapi.com/api/episode/${episodeId}`);
  }

  getLocationByUrl(url: string) {
    return this.http.get<any>(url);
  }
}
