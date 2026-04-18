import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { DirectorioComponent } from './directorio.component';
import { DirectorioRoutingModule } from './directorio-routing.module';

@NgModule({
  declarations: [DirectorioComponent],
  imports: [
    SharedModule,
    DirectorioRoutingModule
  ]
})
export class DirectorioModule { }
