import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { AppComponent } from './app.component';
import { ClienteListComponent } from './cliente-list.component';
import { KanbanBoardComponent } from './kanban-board.component';
import { HomeComponent } from './components/home/home.component';
import { PhonePipe } from './pipes/phone.pipe';
import { DirectorioComponent } from './components/directorio/directorio.component';
import { MetricasComponent } from './components/metricas/metricas.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
@NgModule({
  declarations: [
    AppComponent,
    ClienteListComponent,
    KanbanBoardComponent,
    HomeComponent,
    PhonePipe,
    DirectorioComponent,
    MetricasComponent,
    ConfiguracionComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    CommonModule,
    HttpClientModule,
    FormsModule,
    DragDropModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
