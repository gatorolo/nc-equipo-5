import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { DirectorioComponent } from './components/directorio/directorio.component';
import { MetricasComponent } from './components/metricas/metricas.component';
import { ConfiguracionComponent } from './components/configuracion/configuracion.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'directorio', component: DirectorioComponent },
  { path: 'metricas', component: MetricasComponent },
  { path: 'configuracion', component: ConfiguracionComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
