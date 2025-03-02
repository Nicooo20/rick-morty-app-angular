import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { CharacterTableComponent } from './components/character-table/character-table.component';
import { CharacterDetailComponent } from './components/character-detail/character-detail.component';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { CharacterDetailPageComponent } from './pages/character-detail-page/character-detail-page.component';
import { HeaderComponent } from './components/header/header.component';
import { TotalsComponent } from './components/totals/totals.component';

// Módulos de Angular Material
import { MatToolbarModule } from '@angular/material/toolbar'; // Para el header
import { MatTableModule } from '@angular/material/table'; // Para la tabla
import { MatInputModule } from '@angular/material/input'; // Para los inputs de filtro
import { MatSelectModule } from '@angular/material/select'; // Para los selects de filtro
import { MatButtonModule } from '@angular/material/button'; // Para los botones
import { MatCardModule } from '@angular/material/card'; // Para las tarjetas de detalles
import { MatTabsModule } from '@angular/material/tabs'; // Para las pestañas de totales
import { MatPaginatorModule } from '@angular/material/paginator'; // Para la paginación de la tabla
import { MatIconModule } from '@angular/material/icon'; // Para íconos
import { MatSortModule } from '@angular/material/sort'; // Para ordenar la tabla
import { MatTooltipModule } from '@angular/material/tooltip';

import { SharedModule } from './shared/shared.module';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { reducers } from './store/app.state';
import { CharacterEffects } from './store/effects/character.effects';

@NgModule({
  declarations: [
    AppComponent,
    CharacterTableComponent,
    CharacterDetailComponent,
    HomePageComponent,
    CharacterDetailPageComponent,
    HeaderComponent,
    TotalsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,

    // Módulos de Angular Material
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatTabsModule,
    MatPaginatorModule,
    MatIconModule, 
    MatToolbarModule,
    MatSortModule,
    MatTooltipModule,

    SharedModule,

    StoreModule.forRoot(reducers),
    EffectsModule.forRoot([CharacterEffects])
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
