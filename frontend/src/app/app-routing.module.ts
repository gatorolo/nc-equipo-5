import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'directorio', loadChildren: () => import('./components/directorio/directorio.module').then(m => m.DirectorioModule) },
  { path: 'metricas', loadChildren: () => import('./components/metricas/metricas.module').then(m => m.MetricasModule) },
  { path: 'configuracion', loadChildren: () => import('./components/configuracion/configuracion.module').then(m => m.ConfiguracionModule) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
