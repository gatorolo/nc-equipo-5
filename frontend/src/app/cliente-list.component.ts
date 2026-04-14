import { Component, OnInit } from '@angular/core';
import { DataService } from './services/api.service';
import { Cliente } from './models/models';
import { NotificationService } from './services/notification.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cliente-list',
  template: `
    <div class="bg-sagrada-paper rounded-xl shadow-sm border border-[#efe6d8] overflow-hidden">
      
      <div class="p-6 border-b border-[#efe6d8]">
        <h2 class="text-lg font-bold text-sagrada-purple-dark mb-4">Directorio de Clientes</h2>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-end items-center">
          
          <div class="flex gap-2 w-full sm:w-auto">
            <button 
              (click)="setFiltroEstado('Todos')"
              [ngClass]="filtroEstado === 'Todos' ? 'bg-sagrada-purple text-white' : 'bg-[#e6d9ce] text-sagrada-purple hover:bg-[#d6c4b4]'"
              class="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Todos
            </button>
            <button 
              (click)="setFiltroEstado('Activo')"
              [ngClass]="filtroEstado === 'Activo' ? 'bg-sagrada-gold text-white' : 'bg-[#f0e3d2] text-sagrada-gold hover:bg-[#e6d0a7]'"
              class="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Activos
            </button>
            <button 
              (click)="setFiltroEstado('Inactivo')"
              [ngClass]="filtroEstado === 'Inactivo' ? 'bg-sagrada-purple text-white' : 'bg-[#e6d9ce] text-sagrada-purple hover:bg-[#d6c4b4]'"
              class="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
              Inactivos
            </button>
          </div>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr class="bg-sagrada-bg text-slate-500 text-xs uppercase tracking-wider">
              <th class="px-6 py-4 font-semibold">Cliente</th>
              <th class="px-6 py-4 font-semibold">Empresa</th>
              <th class="px-6 py-4 font-semibold">Estado</th>
              <th class="px-6 py-4 font-semibold">Última Interacción</th>
              <th class="px-6 py-4 font-semibold text-right">Acciones</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
            <tr *ngFor="let cliente of getClientesFiltrados()" class="hover:bg-sagrada-bg transition-colors group">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <img [src]="cliente.avatar" alt="Avatar" class="w-10 h-10 rounded-full shadow-sm">
                  <div>
                    <p class="font-semibold text-sagrada-purple-dark">{{ cliente.nombre }}</p>
                    <p class="text-xs text-slate-500">ID: {{ cliente.id }}</p>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 text-slate-600 font-medium">{{ cliente.empresa }}</td>
              <td class="px-6 py-4">
                <span 
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  [ngClass]="cliente.estado === 'Activo' ? 'bg-[#e6cc98] text-[#7a5c18]' : 'bg-slate-100 text-slate-600'">
                  {{ cliente.estado }}
                </span>
              </td>
              <td class="px-6 py-4 text-slate-500">{{ cliente.ultimaInteraccion | date:'mediumDate' }}</td>
              <td class="px-6 py-4 text-right">
                <div class="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button (click)="enviarWhatsApp(cliente)" title="Enviar WhatsApp" class="text-slate-400 hover:text-emerald-500 transition-colors p-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                  </button>
                  <button (click)="abrirModalCorreo(cliente)" title="Redactar Correo" class="text-sagrada-purple hover:bg-sagrada-purple/10 transition-colors p-2 rounded-lg border border-sagrada-purple/10">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                    </svg>
                  </button>
                  <button (click)="eliminarCliente(cliente)" title="Eliminar Contacto" class="text-slate-400 hover:text-red-500 transition-colors p-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </td>
            </tr>
            
            <tr *ngIf="getClientesFiltrados().length === 0">
              <td colspan="5" class="px-6 py-12 text-center text-slate-500">
                <div class="flex flex-col items-center justify-center">
                  <svg class="w-12 h-12 text-slate-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path></svg>
                  <p class="text-base font-medium text-slate-600">No se encontraron clientes</p>
                  <p class="text-sm">Intenta ajustar los filtros de búsqueda</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL: REDACTAR CORREO (DASHBOARD) -->
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
              <button (click)="procesarEnvio()" [disabled]="enviando"
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
export class ClienteListComponent implements OnInit {

  clientes: Cliente[] = [];
  busquedaGlobal: string = '';
  filtroEstado: 'Todos' | 'Activo' | 'Inactivo' = 'Todos';

  // --- Email Logic ---
  mostrarModalCorreo: boolean = false;
  datosCorreo = { to: '', subject: '', body: '' };
  enviando: boolean = false;

  constructor(private dataService: DataService, private notifService: NotificationService) { }

  ngOnInit() {
    this.cargarClientes();
    this.dataService.busquedaGlobal$.subscribe(term => {
      this.busquedaGlobal = term;
    });
  }

  cargarClientes() {
    this.dataService.getClientes().subscribe(data => {
      this.clientes = data;
    });
  }

  setFiltroEstado(estado: 'Todos' | 'Activo' | 'Inactivo') {
    this.filtroEstado = estado;
  }

  getClientesFiltrados(): Cliente[] {
    const termGlobal = this.busquedaGlobal.toLowerCase();
    const estado = this.filtroEstado;

    return this.clientes.filter(c => {
      const coincideGlobal = c.nombre.toLowerCase().includes(termGlobal) || c.empresa.toLowerCase().includes(termGlobal);
      const coincideEstado = estado === 'Todos' || c.estado === estado;

      return coincideGlobal && coincideEstado;
    });
  }

  enviarWhatsApp(cliente: Cliente) {
    const telefono = cliente.telefono ? cliente.telefono.replace(/\D/g, '') : '5491122334455';
    const mensaje = encodeURIComponent(`Hola ${cliente.nombre}`);
    window.open(`https://wa.me/${telefono}?text=${mensaje}`, '_blank');
  }

  eliminarCliente(cliente: Cliente) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `Vas a eliminar a ${cliente.nombre}. Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#4A2B65',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.deleteCliente(cliente.id!).subscribe({
          next: () => {
            Swal.fire('Eliminado', 'El contacto ha sido eliminado.', 'success');
            this.cargarClientes();
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar el contacto.', 'error')
        });
      }
    });
  }

  abrirModalCorreo(cliente: Cliente) {
    this.datosCorreo = {
      to: cliente.email || '',
      subject: '',
      body: ''
    };
    this.mostrarModalCorreo = true;
  }

  cerrarModalCorreo() {
    this.mostrarModalCorreo = false;
  }

  procesarEnvio() {
    if (!this.datosCorreo.subject || !this.datosCorreo.body) {
      Swal.fire('Atención', 'Por favor completa el asunto y el mensaje.', 'warning');
      return;
    }

    this.enviando = true;
    this.notifService.sendEmail(this.datosCorreo).subscribe({
      next: () => {
        this.enviando = false;
        this.cerrarModalCorreo();
        Swal.fire('¡Enviado!', `Correo enviado a ${this.datosCorreo.to} con éxito.`, 'success');
      },
      error: (err) => {
        this.enviando = false;
        Swal.fire('Error', 'No se pudo enviar el correo. Revisa la consola para más detalles.', 'error');
      }
    });
  }
}
