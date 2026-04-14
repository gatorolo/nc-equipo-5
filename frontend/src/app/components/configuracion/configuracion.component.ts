import { Component, OnInit } from '@angular/core';
import { DataService } from '../../services/api.service';
import { ThemeService } from '../../services/theme.service';
import { EtapaTrato, PipelineStage } from '../../models/models';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface PerfilAdmin {
  nombre: string;
  email: string;
  telefono: string;
  avatar: string;
}

interface DatosEmpresa {
  nombreComercial: string;
  razonSocial: string;
  cuit: string;
  direccion: string;
  telefono: string;
  sitioWeb: string;
}

@Component({
  selector: 'app-configuracion',
  templateUrl: './configuracion.component.html',
  styleUrls: ['./configuracion.component.css']
})
export class ConfiguracionComponent implements OnInit {

  // Sección activa del sidebar interno
  seccionActiva: string = 'perfil';

  // Se inicializan vacíos esperando la conexión al backend
  perfil: PerfilAdmin = { nombre: '', email: '', telefono: '', avatar: '' };
  empresa: DatosEmpresa = { nombreComercial: '', razonSocial: '', cuit: '', direccion: '', telefono: '', sitioWeb: '' };

  // Etapas del Pipeline
  etapasPipeline: PipelineStage[] = [];
  nuevaEtapa: string = '';
  nuevaPassword: string = '';

  // Modo Oscuro Automático
  isDarkModeAutomatic: boolean = false;

  // Módulos Próximamente
  modulosProximamente = [
    { titulo: 'Gestión de Usuarios', descripcion: 'Invitar vendedores, asignar roles y permisos.', icono: '👥' },
    { titulo: 'Notificaciones', descripcion: 'Alertas por email y WhatsApp cuando un trato cambia.', icono: '🔔' },
    { titulo: 'Modo Oscuro', descripcion: 'Alternar entre tema claro y oscuro para tu CRM.', icono: '🌙' },
    { titulo: 'Integraciones', descripcion: 'Conectar WhatsApp Business, Mailchimp y Google Calendar.', icono: '🔗' },
    { titulo: 'Exportar Datos', descripcion: 'Descargar clientes y tratos en CSV o Excel.', icono: '📥' },
    { titulo: 'Auditoría', descripcion: 'Historial de cambios realizados por cada usuario.', icono: '📋' }
  ];

  constructor(
    private dataService: DataService,
    private themeService: ThemeService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.isDarkModeAutomatic = this.themeService.isDarkModeAutomatic;
    this.cargarPerfil();
    this.cargarEmpresa();
    this.cargarEtapas();
  }

  cargarPerfil(): void {
    this.dataService.getProfile().subscribe({
      next: (data) => {
        this.perfil = data;
        if (data.avatar) {
          this.dataService.setAvatarAdmin(data.avatar);
        }
        if (data.nombre) {
          this.dataService.setNombreAdmin(data.nombre);
        }
      },
      error: () => console.error('Error al cargar Perfil de Usuario')
    });
  }

  cargarEmpresa(): void {
    this.dataService.getCompany().subscribe({
      next: (data) => this.empresa = data,
      error: () => console.error('Error al cargar Datos de Empresa')
    });
  }

  cargarEtapas(): void {
    this.dataService.getPipelineStages().subscribe({
      next: (stages) => this.etapasPipeline = stages,
      error: () => console.error('Error al cargar Etapas')
    });
  }

  toggleDarkModeAutomatic(): void {
    this.themeService.setDarkModeAutomatic(this.isDarkModeAutomatic);
    
    // Notificación visual de cambio
    const msg = this.isDarkModeAutomatic 
      ? 'Modo Oscuro automático activado (20:00 - 08:00)' 
      : 'Modo Oscuro automático desactivado';
      
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'success',
      title: msg,
      showConfirmButton: false,
      timer: 2000
    });
  }

  cambiarSeccion(seccion: string): void {
    this.seccionActiva = seccion;
  }

  async guardarPerfil() {
    if (this.perfil.telefono) {
      localStorage.setItem('whatsapp_phone', this.perfil.telefono);
    }
    
    if (this.perfil.nombre) {
      this.dataService.setNombreAdmin(this.perfil.nombre);
    }

    try {
      // 1. Actualizar datos generales de perfil
      await this.dataService.updateProfile(this.perfil).toPromise();

      // 2. Si hay una nueva contraseña escrita, procesar el cambio
      if (this.nuevaPassword && this.nuevaPassword.trim() !== '') {
        const { value: passActual } = await Swal.fire({
          title: 'Confirmar Cambio',
          input: 'password',
          inputLabel: 'Ingresa tu contraseña actual para confirmar la nueva',
          inputPlaceholder: 'Contraseña Actual',
          showCancelButton: true,
          confirmButtonColor: '#4A2B65'
        });

        if (passActual) {
          await this.dataService.changePassword(passActual, this.nuevaPassword).toPromise();
          this.nuevaPassword = ''; // Limpiar el campo
          Swal.fire({
            icon: 'success',
            title: '¡Todo Guardado!',
            text: 'Tu perfil y contraseña han sido actualizados.',
            confirmButtonColor: '#4A2B65'
          });
        } else {
          Swal.fire('Perfil Guardado', 'Se guardaron tus datos pero la contraseña NO cambió (falta confirmación).', 'info');
        }
      } else {
        Swal.fire({ 
          icon: 'success', 
          title: '¡Perfil Actualizado!', 
          confirmButtonColor: '#4A2B65', 
          timer: 2000 
        });
      }
    } catch (error: any) {
      Swal.fire('Error', error.error?.message || 'No se pudieron guardar los cambios', 'error');
    }
  }

  onAvatarChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const archivo = input.files[0];

    // Validar tamaño (máx 5MB)
    if (archivo.size > 5 * 1024 * 1024) {
      Swal.fire('Archivo muy grande', 'La imagen no puede superar los 5MB.', 'warning');
      return;
    }

    // Validar tipo
    if (!archivo.type.startsWith('image/')) {
      Swal.fire('Formato inválido', 'Solo se permiten archivos de imagen (JPG, PNG, WEBP).', 'warning');
      return;
    }

    // 1. Mostrar preview inmediato
    const reader = new FileReader();
    reader.onload = () => {
      this.perfil.avatar = reader.result as string;
    };
    reader.readAsDataURL(archivo);

    // 2. Subir archivo real al servidor
    this.dataService.uploadAvatar(archivo).subscribe({
      next: (res) => {
        this.perfil.avatar = res.url;
        this.dataService.setAvatarAdmin(res.url);
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Foto de perfil subida al servidor',
          showConfirmButton: false,
          timer: 2000
        });
      },
      error: () => Swal.fire('Error', 'No se pudo subir la imagen al servidor', 'error')
    });
  }

  guardarEmpresa(): void {
    this.dataService.updateCompany(this.empresa).subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: '¡Datos de Empresa Guardados!', confirmButtonColor: '#4A2B65', timer: 3000 });
      },
      error: () => Swal.fire('Error', 'No se pudieron guardar los datos', 'error')
    });
  }

  agregarEtapa(): void {
    if (!this.nuevaEtapa.trim()) return;
    const colores = ['bg-rose-500', 'bg-cyan-500', 'bg-orange-500', 'bg-fuchsia-500', 'bg-lime-500'];
    const colorRandom = colores[this.etapasPipeline.length % colores.length];
    
    const nueva: PipelineStage = {
      nombre: this.nuevaEtapa.trim(),
      color: colorRandom,
      orden: this.etapasPipeline.length
    };

    this.dataService.savePipelineStage(nueva).subscribe({
      next: (saved) => {
        this.etapasPipeline.push(saved);
        this.nuevaEtapa = '';
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Etapa guardada permanentemente',
          showConfirmButton: false,
          timer: 2000
        });
      },
      error: () => Swal.fire('Error', 'No se pudo guardar la etapa', 'error')
    });
  }

  eliminarEtapa(index: number): void {
    if (this.etapasPipeline.length <= 2) {
      Swal.fire('Error', 'El pipeline necesita al menos 2 etapas.', 'warning');
      return;
    }
    const etapa = this.etapasPipeline[index];
    Swal.fire({
      title: `¿Eliminar "${etapa.nombre}"?`,
      text: 'Los tratos en esta etapa se moverán a la primera.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then(result => {
      if (result.isConfirmed && etapa.id) {
        this.dataService.deletePipelineStage(etapa.id).subscribe({
          next: () => {
            this.etapasPipeline.splice(index, 1);
            Swal.fire('Eliminado', 'Etapa borrada de la base de datos', 'success');
          },
          error: () => Swal.fire('Error', 'No se pudo eliminar la etapa', 'error')
        });
      }
    });
  }
}
