import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/api.service';
import { Cliente } from '../../models/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-directorio',
  templateUrl: './directorio.component.html',
  styleUrls: ['./directorio.component.css']
})
export class DirectorioComponent implements OnInit {
  clientes: Cliente[] = [];
  clientesFiltrados: Cliente[] = [];
  busquedaGlobal: string = '';
  mostrarModalNuevoCliente: boolean = false;
  mostrarModalCorreo: boolean = false;
  clienteSeleccionado: Cliente | null = null;
  
  datosCorreo: { to: string; subject: string; body: string } = {
    to: '',
    subject: '',
    body: ''
  };
  enviandoCorreo: boolean = false;
  
  esModoEdicion: boolean = false;
  idEdicion: number | undefined;
  
  nuevoClienteData: {
    nombre: string;
    empresa: string;
    email: string;
    telefono: string;
    estado: 'Activo' | 'Inactivo';
    genero: 'Masculino' | 'Femenino';
  } = {
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    estado: 'Activo',
    genero: 'Masculino'
  };

  constructor(private dataService: DataService) {}

  ngOnInit() {
    this.dataService.getClientes().subscribe(data => {
      this.clientes = data;
      this.aplicarFiltro();
    });
    this.dataService.busquedaGlobal$.subscribe(term => {
      this.busquedaGlobal = term;
      this.aplicarFiltro();
    });
  }

  aplicarFiltro() {
    const term = this.busquedaGlobal.toLowerCase();
    this.clientesFiltrados = this.clientes.filter(c => 
      c.nombre.toLowerCase().includes(term) || c.empresa.toLowerCase().includes(term)
    );
  }

  abrirModalNuevoCliente() {
    this.esModoEdicion = false;
    this.idEdicion = undefined;
    this.mostrarModalNuevoCliente = true;
    this.nuevoClienteData = { nombre: '', empresa: '', email: '', telefono: '', estado: 'Activo', genero: 'Masculino' };
  }

  editarCliente(cliente: Cliente) {
    this.esModoEdicion = true;
    this.idEdicion = cliente.id;
    this.nuevoClienteData = {
      nombre: cliente.nombre,
      empresa: cliente.empresa,
      email: cliente.email || '',
      telefono: cliente.telefono || '',
      estado: cliente.estado as 'Activo' | 'Inactivo',
      genero: cliente.avatar.includes('avatar-f') ? 'Femenino' : 'Masculino'
    };
    this.cerrarDetalleCliente();
    this.mostrarModalNuevoCliente = true;
  }

  cerrarModalNuevoCliente() {
    this.mostrarModalNuevoCliente = false;
  }

  guardarNuevoCliente() {
    if (!this.nuevoClienteData.nombre || !this.nuevoClienteData.empresa || !this.nuevoClienteData.email || !this.nuevoClienteData.telefono) {
      Swal.fire('Error', 'Todos los campos (Nombre, Empresa, Email y Teléfono) son obligatorios', 'error');
      return;
    }

    if (this.esModoEdicion && this.idEdicion !== undefined) {
      const clienteOriginal = this.clientes.find(c => c.id === this.idEdicion);
      const actualizado: Cliente = {
        id: this.idEdicion,
        nombre: this.nuevoClienteData.nombre,
        empresa: this.nuevoClienteData.empresa,
        email: this.nuevoClienteData.email,
        telefono: this.nuevoClienteData.telefono,
        estado: this.nuevoClienteData.estado,
        avatar: this.nuevoClienteData.genero === 'Femenino' ? 'assets/avatar-f.jfif' : 'assets/avatar-m.jfif',
        ultimaInteraccion: clienteOriginal?.ultimaInteraccion || new Date().toISOString().split('T')[0]
      };
      
      this.dataService.updateCliente(actualizado).subscribe({
        next: () => {
          Swal.fire('¡Actualizado!', `${actualizado.nombre} ha sido actualizado exitosamente.`, 'success');
          this.cerrarModalNuevoCliente();
        },
        error: (err) => {
          Swal.fire('Error', 'Hubo un problema al actualizar el cliente. Verifica si el email ya existe.', 'error');
        }
      });
      
    } else {
      const nuevo: Cliente = {
        nombre: this.nuevoClienteData.nombre,
        empresa: this.nuevoClienteData.empresa,
        email: this.nuevoClienteData.email,
        telefono: this.nuevoClienteData.telefono,
        estado: this.nuevoClienteData.estado,
        avatar: this.nuevoClienteData.genero === 'Femenino' ? 'assets/avatar-f.jfif' : 'assets/avatar-m.jfif',
        ultimaInteraccion: new Date().toISOString().split('T')[0]
      };

      this.dataService.addCliente(nuevo).subscribe({
        next: () => {
          Swal.fire('¡Cliente Agendado!', `${nuevo.nombre} ha sido añadido al directorio exitosamente.`, 'success');
          this.cerrarModalNuevoCliente();
        },
        error: (err) => {
          Swal.fire('Error', 'No se pudo guardar el cliente. Es posible que el email ya esté registrado.', 'error');
        }
      });
    }
  }

  eliminarCliente(id: number | undefined) {
    if(id === undefined) return;
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: "¡No podrás revertir esto! El cliente será eliminado.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.dataService.deleteCliente(id).subscribe({
          next: () => {
            Swal.fire('¡Eliminado!', 'El cliente ha sido eliminado.', 'success');
            this.cerrarDetalleCliente();
          },
          error: (err) => {
            Swal.fire('Error', 'No se pudo eliminar el cliente.', 'error');
          }
        });
      }
    });
  }

  verDetalleCliente(cliente: Cliente) {
    this.clienteSeleccionado = cliente;
  }

  cerrarDetalleCliente() {
    this.clienteSeleccionado = null;
  }

  abrirModalCorreo(cliente: Cliente) {
    this.datosCorreo = {
      to: cliente.email || '',
      subject: '',
      body: ''
    };
    this.mostrarModalCorreo = true;
    this.cerrarDetalleCliente();
  }

  cerrarModalCorreo() {
    this.mostrarModalCorreo = false;
  }

  enviarCorreo() {
    if (!this.datosCorreo.subject || !this.datosCorreo.body) {
      Swal.fire('Error', 'El asunto y el cuerpo del mensaje son obligatorios.', 'warning');
      return;
    }

    this.enviandoCorreo = true;
    this.dataService.enviarEmail(this.datosCorreo).subscribe({
      next: () => {
        this.enviandoCorreo = false;
        this.cerrarModalCorreo();
        Swal.fire({
          icon: 'success',
          title: '¡Correo Enviado!',
          text: `El mensaje para ${this.datosCorreo.to} ha sido despachado correctamente.`,
          confirmButtonColor: '#4A2B65'
        });
      },
      error: (err) => {
        this.enviandoCorreo = false;
        console.error('Error enviando correo:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de Envío',
          text: 'No se pudo enviar el correo. Verifica tu configuración SMTP en el servidor.',
          confirmButtonColor: '#4A2B65'
        });
      }
    });
  }
}
