import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { MetricasComponent } from './metricas.component';
import { MetricasRoutingModule } from './metricas-routing.module';

@NgModule({
  declarations: [MetricasComponent],
  imports: [
    SharedModule,
    MetricasRoutingModule
  ]
})
export class MetricasModule { }
