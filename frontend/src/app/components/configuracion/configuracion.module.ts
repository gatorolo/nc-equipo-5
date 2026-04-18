import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { ConfiguracionComponent } from './configuracion.component';
import { ConfiguracionRoutingModule } from './configuracion-routing.module';

@NgModule({
  declarations: [ConfiguracionComponent],
  imports: [
    SharedModule,
    ConfiguracionRoutingModule
  ]
})
export class ConfiguracionModule { }
