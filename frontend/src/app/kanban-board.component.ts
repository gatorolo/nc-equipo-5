import { Component, OnInit } from '@angular/core';
import { DataService } from './services/api.service';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Trato, EtapaTrato, Cliente, PipelineStage } from './models/models';
import { NotificationService } from './services/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-kanban-board',
  template: `
    <div class="bg-sagrada-bg min-h-[600px] rounded-xl">
      <div class="p-6 border-b border-[#d5c3af] bg-sagrada-paper rounded-t-xl flex justify-between items-center">
        <div>
          <h2 class="text-xl font-bold text-sagrada-purple-dark">Pipeline de Ventas</h2>
          <p class="text-sm text-slate-500 mt-1">Arrastra y suelta oportunidades para avanzar en el pipeline</p>
        </div>
        <button (click)="abrirModalTrato()" class="bg-sagrada-purple hover:bg-sagrada-purple-dark text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
          + Añadir Trato
        </button>
      </div>

      <div cdkDropListGroup class="p-4 flex gap-3 overflow-x-auto pb-8 items-start">
        
        <div *ngFor="let columna of columnas" class="flex-1 min-w-[160px] lg:min-w-[200px] xl:min-w-[240px] bg-sagrada-paper/60 rounded-xl p-3 border border-[#d5c3af]/60">
          
          <div class="flex justify-between items-center mb-4 px-1">
            <h3 class="font-bold text-slate-700 text-sm uppercase tracking-wider flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full" [ngClass]="columna.color"></span>
              {{ columna.nombre }}
            </h3>
            <span class="bg-sagrada-bg text-slate-600 text-xs font-bold px-2 py-1 rounded-md">
              {{ tratosPorEtapa[columna.nombre].length }}
            </span>
          </div>

          <div class="space-y-3 min-h-[150px]"
               cdkDropList
               [cdkDropListData]="tratosPorEtapa[columna.nombre]"
               (cdkDropListDropped)="drop($event, columna.nombre)">
            <div *ngFor="let trato of tratosPorEtapa[columna.nombre]" 
                 cdkDrag
                 class="bg-sagrada-paper p-4 rounded-xl shadow-sm border border-[#d5c3af] cursor-grab active:cursor-grabbing hover:shadow-md hover:border-sagrada-gold transition-all group max-w-full">
              
              <div *cdkDragPlaceholder class="bg-slate-100/50 border-2 border-dashed border-[#d5c3af] rounded-xl h-24"></div>

              <div class="flex justify-between items-start mb-2">
                <span class="text-xs font-bold tracking-wide text-slate-400 uppercase">{{ trato.empresa }}</span>
                <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">                  <button (click)="enviarWhatsApp(trato)" aria-label="Enviar WhatsApp" title="Enviar WhatsApp" class="text-slate-300 hover:text-emerald-500 transition-colors p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </button>
                  <button (click)="abrirModalCorreo(trato)" aria-label="Redactar Correo" title="Redactar Correo" class="text-sagrada-purple hover:bg-sagrada-purple/10 transition-colors p-1.5 rounded-lg border border-sagrada-purple/10">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button (click)="eliminarTrato(trato)" aria-label="Eliminar Trato" title="Eliminar Trato" class="text-slate-300 hover:text-red-500 transition-colors p-1">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>

              <h4 class="font-semibold text-sagrada-purple-dark leading-tight mb-3">
                {{ trato.nombre }}
              </h4>
              <div class="pt-3 border-t border-[#eee4d8] flex justify-between items-center">
                <span class="text-slate-500 text-xs font-medium">Monto estimado</span>
                <span class="font-bold text-sagrada-purple-dark bg-[#e6cc98] text-[#7a5c18] px-2 py-1 rounded-md text-sm">
                  {{ trato.monto | currency:'USD':'symbol':'1.0-0' }}
                </span>
              </div>
            </div>

            <div *ngIf="tratosPorEtapa[columna.nombre].length === 0" 
                 class="border-2 border-dashed border-transparent rounded-xl p-4 flex flex-col items-center justify-center text-slate-400 pointer-events-none">
              <span class="text-xs font-medium">Arrastra aquí</span>
            </div>
          </div>

        </div>

      </div>
    </div>

    <!-- MODAL: NUEVO TRATO -->
    <div *ngIf="mostrarModalNuevoTrato" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 transition-all" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in-up border border-white/20 dark:border-slate-800">
        <div class="bg-sagrada-bg dark:bg-slate-800 p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
          <h3 id="modalTitle" class="text-lg font-bold text-sagrada-purple-dark dark:text-slate-100">Nuevo Trato</h3>
          <button (click)="cerrarModalTrato()" aria-label="Cerrar modal" class="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label for="dealName" class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Nombre del Trato</label>
            <input id="dealName" name="dealName" type="text" [(ngModel)]="nuevoTrato.nombre" placeholder="Ej. Renovación Licencias" 
                   class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-sagrada-purple focus:ring-1 focus:ring-sagrada-purple outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500">
          </div>
          <div class="relative">
            <label for="dealClient" class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Cliente Asociado</label>
            
            <div class="relative">
              <input id="dealClient" type="text" 
                     autocomplete="off"
                     [(ngModel)]="busquedaClienteModal" 
                     (focus)="mostrarDropdownClientes = true"
                     (input)="mostrarDropdownClientes = true"
                     placeholder="Escribe para buscar un cliente..." 
                     class="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-sagrada-purple focus:ring-1 focus:ring-sagrada-purple outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all">
              <svg class="w-4 h-4 absolute left-4 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              
              <button *ngIf="nuevoTrato.clienteId" (click)="limpiarClienteModal()" aria-label="Limpiar búsqueda" class="absolute right-3 top-2.5 text-slate-400 hover:text-red-500 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <ul *ngIf="mostrarDropdownClientes" 
                class="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-60 overflow-auto divide-y divide-slate-100 dark:divide-slate-700">
              <li *ngIf="getClientesFiltradosModal().length === 0" class="p-4 text-center text-sm text-slate-500">
                No se encontraron coincidencias.
              </li>
              <li *ngFor="let cliente of getClientesFiltradosModal()" 
                  (click)="seleccionarClienteModal(cliente)"
                  class="p-3 hover:bg-sagrada-bg dark:hover:bg-slate-700 cursor-pointer transition-colors flex items-center gap-3">
                <img [src]="cliente.avatar || 'https://i.pravatar.cc/150?img=11'" alt="Avatar de {{ cliente.nombre }}" class="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-600">
                <div>
                  <p class="text-sm font-bold text-sagrada-purple-dark dark:text-slate-100 leading-none">{{ cliente.nombre }}</p>
                  <p class="text-[10px] font-semibold text-slate-400 uppercase mt-0.5">{{ cliente.empresa }}</p>
                </div>
              </li>
            </ul>
            
            <div *ngIf="mostrarDropdownClientes" (click)="mostrarDropdownClientes = false" class="fixed inset-0 z-0"></div>
          </div>
          <div>
            <label for="dealAmount" class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Monto Estimado (USD)</label>
            <input id="dealAmount" name="dealAmount" type="number" [(ngModel)]="nuevoTrato.monto" placeholder="Ej. 15000" 
                   class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-sagrada-purple focus:ring-1 focus:ring-sagrada-purple outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500">
          </div>
          <div>
            <label for="dealStage" class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Etapa Inicial</label>
            <select id="dealStage" name="dealStage" [(ngModel)]="nuevoTrato.etapa" 
                    class="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-sagrada-purple focus:ring-1 focus:ring-sagrada-purple outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">
              <option *ngFor="let col of columnas" [value]="col.nombre">{{ col.nombre }}</option>
            </select>
          </div>
          
          <div class="pt-4 flex gap-3 justify-end">
            <button (click)="cerrarModalTrato()" class="px-5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancelar</button>
            <button (click)="guardarTrato()" aria-label="Confirmar guardar trato" [disabled]="!nuevoTrato.nombre || !nuevoTrato.clienteId || !nuevoTrato.monto" class="px-5 py-2 rounded-xl bg-sagrada-purple hover:bg-sagrada-purple-dark text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm">Guardar Trato</button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: REDACTAR CORREO (PIPELINE) -->
    <div *ngIf="mostrarModalCorreo" class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4">
      <div class="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-fade-in-up">
        <div class="h-2 bg-gradient-to-r from-sagrada-purple via-sagrada-gold to-sagrada-purple"></div>
        <button (click)="cerrarModalCorreo()" class="absolute top-6 right-6 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>

        <div class="p-10 text-left">
          <div class="flex items-center gap-4 mb-8">
            <div class="w-14 h-14 bg-sagrada-purple/10 text-sagrada-purple rounded-2xl flex items-center justify-center shadow-inner">
              <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <div>
              <h2 class="text-2xl font-black text-slate-800 tracking-tight">Enviar Correo</h2>
              <p class="text-sm text-slate-500 font-medium">Destinatario: <span class="text-sagrada-purple font-bold">{{ datosCorreo.to }}</span></p>
            </div>
          </div>

          <div class="space-y-6">
            <div class="relative">
              <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Asunto</label>
              <input type="text" [(ngModel)]="datosCorreo.subject" placeholder="Ej: Información de pedido"
                class="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-sagrada-purple focus:ring-4 focus:ring-sagrada-purple/5 outline-none bg-slate-50/50 transition-all font-semibold text-slate-700">
            </div>

            <div class="relative">
              <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mensaje</label>
              <textarea [(ngModel)]="datosCorreo.body" rows="6" placeholder="Escribe el contenido aquí..."
                class="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-sagrada-purple focus:ring-4 focus:ring-sagrada-purple/5 outline-none bg-slate-50/50 transition-all font-medium text-slate-600 resize-none"></textarea>
            </div>

            <div class="pt-4 flex items-center gap-4 text-center">
              <button (click)="cerrarModalCorreo()" class="flex-1 px-6 py-4 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">
                Cancelar
              </button>
              <button (click)="procesarEnvioEmail()" [disabled]="enviando"
                class="flex-[2] bg-sagrada-purple hover:bg-sagrada-purple-dark text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-purple-200 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                <span *ngIf="!enviando">ENVIAR CORREO</span>
                <span *ngIf="enviando">ENVIANDO...</span>
                <svg *ngIf="!enviando" class="w-5 h-5 rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class KanbanBoardComponent implements OnInit {

  tratosPorEtapa: Record<string, Trato[]> = {};
  columnas: PipelineStage[] = [];

  clientes: Cliente[] = [];

  busquedaClienteModal: string = '';
  mostrarDropdownClientes: boolean = false;

  mostrarModalNuevoTrato: boolean = false;
  nuevoTrato: Partial<Trato> = {
    nombre: '',
    clienteId: '',
    monto: 0,
    etapa: ''
  };

  // --- Email Logic ---
  mostrarModalCorreo: boolean = false;
  datosCorreo = { to: '', subject: '', body: '' };
  enviando: boolean = false;

  constructor(private dataService: DataService, private notifService: NotificationService) { }

  ngOnInit(): void {
    // 1. Cargar Etapas
    this.dataService.getPipelineStages().subscribe({
      next: (stages) => {
        this.columnas = stages;
        // Inicializar objeto de trato por etapa
        stages.forEach(s => this.tratosPorEtapa[s.nombre] = []);
        
        // 2. Cargar Tratos una vez tenemos las etapas
        this.cargarTratos();
      },
      error: (err) => console.error("Error cargando etapas", err)
    });

    this.dataService.getClientes().subscribe(data => {
      this.clientes = data;
    });
  }

  cargarTratos() {
    this.dataService.getTratos().subscribe({
      next: (data: Trato[]) => {
        // Limpiar para recargar
        this.columnas.forEach(col => this.tratosPorEtapa[col.nombre] = []);
        data.forEach(trato => {
          if (this.tratosPorEtapa[trato.etapa]) {
            this.tratosPorEtapa[trato.etapa].push(trato);
          }
        });
      },
      error: (err: any) => console.error("Error cargando tratos", err)
    });
  }

  drop(event: CdkDragDrop<Trato[]>, etapaDestino: string) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      this.notifService.playSuccessSound();
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
      const tratoMovido = event.container.data[event.currentIndex];
      if (tratoMovido.id) {
        this.dataService.updateTratoEtapa(tratoMovido.id, etapaDestino as EtapaTrato).subscribe({
          next: () => this.notifService.playSuccessSound(),
          error: () => Swal.fire('Error', 'No se pudo actualizar la etapa', 'error')
        });
      }
    }
  }

  abrirModalTrato() {
    const primeraEtapa = this.columnas.length > 0 ? this.columnas[0].nombre : '';
    this.nuevoTrato = { nombre: '', clienteId: '', monto: null as any, etapa: primeraEtapa };
    this.busquedaClienteModal = '';
    this.mostrarDropdownClientes = false;
    this.mostrarModalNuevoTrato = true;
  }

  cerrarModalTrato() {
    this.mostrarModalNuevoTrato = false;
    this.mostrarDropdownClientes = false;
  }

  getClientesFiltradosModal(): Cliente[] {
    const search = this.busquedaClienteModal.toLowerCase();
    if (!search) return this.clientes;
    return this.clientes.filter(c =>
      c.nombre.toLowerCase().includes(search) ||
      c.empresa.toLowerCase().includes(search)
    );
  }

  seleccionarClienteModal(cliente: Cliente) {
    this.nuevoTrato.clienteId = cliente.id?.toString();
    this.busquedaClienteModal = `${cliente.nombre} (${cliente.empresa})`;
    this.mostrarDropdownClientes = false;
  }

  limpiarClienteModal() {
    this.nuevoTrato.clienteId = '';
    this.busquedaClienteModal = '';
    this.mostrarDropdownClientes = true;
  }

  guardarTrato() {
    if (this.nuevoTrato.nombre && this.nuevoTrato.clienteId && this.nuevoTrato.monto) {

      const clienteSeleccionado = this.clientes.find(c => c.id?.toString() === this.nuevoTrato.clienteId);
      const nombreEmpresa = clienteSeleccionado ? clienteSeleccionado.empresa : 'Empresa Desconocida';

      const nuevo: Trato = {
        nombre: this.nuevoTrato.nombre,
        empresa: nombreEmpresa,
        monto: this.nuevoTrato.monto,
        etapa: this.nuevoTrato.etapa as EtapaTrato,
        clienteId: this.nuevoTrato.clienteId
      };
      
      this.dataService.addTrato(nuevo).subscribe({
        next: () => {
          this.cerrarModalTrato();
          this.notifService.playSuccessSound();
          Swal.fire('¡Creado!', 'El trato ha sido añadido al Pipeline', 'success');
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo conectar con el servidor', 'error');
        }
      });
    }
  }

  enviarWhatsApp(trato: Trato) {
    const cliente = this.clientes.find(c => c.id?.toString() === trato.clienteId);
    const telefono = cliente?.telefono ? cliente.telefono.replace(/\D/g, '') : '5491122334455';
    const mensaje = encodeURIComponent(`Hola ${cliente ? cliente.nombre : 'Cliente'}, te contactamos para actualizarte sobre el trato: ${trato.nombre}`);
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  }

  abrirModalCorreo(trato: Trato) {
    const cliente = this.clientes.find(c => c.id?.toString() === trato.clienteId);
    this.datosCorreo = {
      to: cliente?.email || '',
      subject: `Novedades sobre el trato: ${trato.nombre}`,
      body: `Hola ${cliente ? cliente.nombre : 'Cliente'},\n\nQueríamos contactarte sobre el avance de "${trato.nombre}"...`
    };
    this.mostrarModalCorreo = true;
  }

  cerrarModalCorreo() {
    this.mostrarModalCorreo = false;
  }

  procesarEnvioEmail() {
    if (!this.datosCorreo.subject || !this.datosCorreo.body) {
      Swal.fire('Atención', 'Por favor completa el asunto y el mensaje.', 'warning');
      return;
    }

    this.enviando = true;
    this.notifService.sendEmail(this.datosCorreo).subscribe({
      next: () => {
        this.enviando = false;
        this.cerrarModalCorreo();
        Swal.fire('¡Enviado!', `Correo enviado por el trato "${this.datosCorreo.subject}" con éxito.`, 'success');
      },
      error: (err) => {
        this.enviando = false;
        Swal.fire('Error', 'No se pudo enviar el correo de seguimiento.', 'error');
      }
    });
  }

  eliminarTrato(trato: Trato) {
    if(!trato.id) return;
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar el trato "${trato.nombre}". ¡Esta acción no se puede deshacer!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.deleteTrato(trato.id!).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El trato ha sido removido del pipeline.', 'success');
          },
          error: (err) => {
            Swal.fire('Error', 'Hubo un problema al intentar eliminar el trato.', 'error');
          }
        });
      }
    });
  }
}
