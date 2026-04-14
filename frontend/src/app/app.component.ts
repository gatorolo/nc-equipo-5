import { Component, OnInit } from '@angular/core';
import { AuthService } from './services/auth.service';
import { DataService } from './services/api.service';
import { NotificationService, AppNotification } from './services/notification.service';
import { ThemeService } from './services/theme.service';
import Swal from 'sweetalert2';
import { PhonePipe } from './pipes/phone.pipe';
import { Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  sidebarAbierto: boolean = false;
  isLoggedIn: boolean = false;
  mostrarMenuPerfil: boolean = false;

  mostrarNotificaciones: boolean = false;
  unreadCount: number = 0;
  notifications: AppNotification[] = [];

  isRegistering: boolean = false;
  isForgotPasswordMode: boolean = false;
  isResetPasswordMode: boolean = false;
  mostrarPassword: boolean = false;
  resetToken: string = '';

  nombreAdmin: string = '';
  avatarAdmin: string = '';
  loginData = {
    nombre: '',
    email: 'rodrigodaremberg@gmail.com',
    password: 'Research21@'
  };
  newPassword: string = '';
  isSubmitting: boolean = false;
  zoomActivo: boolean = false;
  altoContrasteActivo: boolean = false;
  private pollingInterval: any;

  constructor(
    private authService: AuthService,
    private dataService: DataService,
    private notifService: NotificationService,
    private themeService: ThemeService,
    private router: Router
  ) { 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        if (this.zoomActivo) {
          // Esperamos un tick para asegurar que el nuevo DOM (componentes) ya se redibujó
          setTimeout(() => this.refreshLupa(), 300);
        }
      }
    });
  }

  ngOnInit() {
    if (this.authService.getToken()) {
      this.isLoggedIn = true;
      this.loadUserProfile();
      this.iniciarPollingNotificaciones();
    }

    this.notifService.notifications$.subscribe(notifs => {
      this.notifications = notifs;
      // Backend uses 'isRead' (boolean), frontend AppNotification also has 'read'
      // Mapping was done in service, but let's double check counts
      this.unreadCount = notifs.filter(n => !n.read).length;
      
      // Si hay nuevas notificaciones no leídas y el contador aumentó, podríamos sonar la campanita
      // Pero por ahora solo refrescamos la lista
    });

    this.dataService.avatarAdmin$.subscribe(avatar => {
      this.avatarAdmin = avatar;
    });

    this.dataService.nombreAdmin$.subscribe(nombre => {
      if (nombre) {
        this.nombreAdmin = nombre;
      }
    });

    // Detectar reset de contraseña por URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('resetToken');
    if (token) {
      this.resetToken = token;
      this.isResetPasswordMode = true;
      this.isLoggedIn = false;
      // Limpiar URL para que no quede el token expuesto al refrescar
      window.history.pushState({}, document.title, window.location.pathname);
    }
  }

  iniciarPollingNotificaciones() {
    // Carga inicial
    this.notifService.loadNotifications();

    // Configurar intervalo cada 30 segundos
    if (this.pollingInterval) clearInterval(this.pollingInterval);
    this.pollingInterval = setInterval(() => {
      this.notifService.loadNotifications();
    }, 30000);
  }

  loadUserProfile() {
    this.dataService.getProfile().subscribe({
      next: (profile) => {
        if (profile.avatar) {
          this.dataService.setAvatarAdmin(profile.avatar);
        } else if (profile.nombre) {
          // Generar avatar con iniciales si no hay foto
          const initialsAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.nombre)}&background=4A2B65&color=fff&bold=true`;
          this.dataService.setAvatarAdmin(initialsAvatar);
        }
        
        if (profile.nombre) {
          this.dataService.setNombreAdmin(profile.nombre);
        }
      },
      error: (err) => console.error('No se pudo cargar el perfil del usuario', err)
    });
  }

  private lensElement: HTMLElement | null = null;
  private clonedContent: HTMLElement | null = null;
  private mouseMoveListener: ((e: MouseEvent) => void) | null = null;
  private clickCloseListener: ((e: MouseEvent) => void) | null = null;
  public zoomScale: number = 2.0;
  public lensSize: number = 250;

  toggleZoom() {
    this.zoomActivo = !this.zoomActivo;
    
    if (this.zoomActivo) {
      this.iniciarLupa();
    } else {
      this.detenerLupa();
    }
  }

  private iniciarLupa() {
    const mainContent = document.getElementById('app-main-content');
    if (!mainContent) return;

    // Crear la lente de la lupa
    this.lensElement = document.createElement('div');
    this.lensElement.id = 'lupa-lens-container';
    this.lensElement.style.position = 'fixed';
    this.lensElement.style.border = '4px solid #4A2B65'; // sagrada-purple-dark
    this.lensElement.style.borderRadius = '50%';
    this.lensElement.style.width = this.lensSize + 'px';
    this.lensElement.style.height = this.lensSize + 'px';
    this.lensElement.style.pointerEvents = 'none';
    this.lensElement.style.overflow = 'hidden';
    this.lensElement.style.zIndex = '9999';
    this.lensElement.style.boxShadow = '0 0 0 9999px rgba(0,0,0,0.5), inset 0 0 20px rgba(0,0,0,0.5), 0 10px 25px rgba(0,0,0,0.5)';
    this.lensElement.style.backgroundColor = '#fff';

    this.refreshLupa(true);
    document.body.appendChild(this.lensElement);
    
    this.mouseMoveListener = this.onMouseMove.bind(this);
    document.addEventListener('mousemove', this.mouseMoveListener);

    // Añadir listener para salir con un click, esperando un poco para evitar que el click de activación lo dispare
    setTimeout(() => {
      this.clickCloseListener = () => {
        this.zoomActivo = false;
        this.detenerLupa();
      };
      document.addEventListener('click', this.clickCloseListener);
    }, 50);
  }

  private refreshLupa(initial: boolean = false) {
    if (!this.zoomActivo || !this.lensElement) return;
    const mainContent = document.getElementById('app-main-content');
    if (!mainContent) return;

    // Clonar el contenido actual
    const newClone = mainContent.cloneNode(true) as HTMLElement;
    newClone.style.position = 'absolute';
    newClone.style.width = mainContent.offsetWidth + 'px';
    newClone.style.height = mainContent.offsetHeight + 'px';
    newClone.style.transformOrigin = '0 0';
    newClone.style.pointerEvents = 'none';

    // Sincronizar las posiciones de scroll del DOM original al clonado
    const originalScrollables = mainContent.querySelectorAll('*');
    const clonedScrollables = newClone.querySelectorAll('*');
    for (let i = 0; i < originalScrollables.length; i++) {
        if (originalScrollables[i].scrollTop > 0 || originalScrollables[i].scrollLeft > 0) {
            clonedScrollables[i].scrollTop = originalScrollables[i].scrollTop;
            clonedScrollables[i].scrollLeft = originalScrollables[i].scrollLeft;
        }
    }
    
    // Remover IDs del clon para evitar conflictos
    const allClonedElements = newClone.querySelectorAll('*');
    allClonedElements.forEach(el => el.removeAttribute('id'));

    if (initial) {
      this.clonedContent = newClone;
      this.lensElement.appendChild(this.clonedContent);
    } else {
      // Reemplazar el viejo clon por el nuevo conservando el transform base (aunque onMouseMove lo sobreescribirá)
      if (this.clonedContent && this.clonedContent.parentNode) {
        newClone.style.transform = this.clonedContent.style.transform;
        this.lensElement.replaceChild(newClone, this.clonedContent);
        this.clonedContent = newClone;
      }
    }
  }



  private detenerLupa() {
    if (this.lensElement && this.lensElement.parentNode) {
      this.lensElement.parentNode.removeChild(this.lensElement);
    }
    this.lensElement = null;
    this.clonedContent = null;
    
    if (this.mouseMoveListener) {
      document.removeEventListener('mousemove', this.mouseMoveListener);
      this.mouseMoveListener = null;
    }
    
    if (this.clickCloseListener) {
      document.removeEventListener('click', this.clickCloseListener);
      this.clickCloseListener = null;
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.zoomActivo || !this.lensElement || !this.clonedContent) return;

    // Sincronizar el scroll en tiempo real
    const mainContent = document.getElementById('app-main-content');
    if (mainContent) {
      const selectors = '.overflow-y-scroll, .overflow-y-auto, .overflow-auto';
      const origScrollables = mainContent.querySelectorAll(selectors);
      const cloneScrollables = this.clonedContent.querySelectorAll(selectors);
      for (let i = 0; i < origScrollables.length; i++) {
        if (cloneScrollables[i]) {
          cloneScrollables[i].scrollTop = origScrollables[i].scrollTop;
          cloneScrollables[i].scrollLeft = origScrollables[i].scrollLeft;
        }
      }
    }

    const x = e.clientX;
    const y = e.clientY;
    const halfLens = this.lensSize / 2;

    // Posicionar la lente en el cursor
    this.lensElement.style.left = (x - halfLens) + 'px';
    this.lensElement.style.top = (y - halfLens) + 'px';

    // Calcular la posición del clon para que haga zoom al centro
    const rx = -x * this.zoomScale + halfLens;
    const ry = -y * this.zoomScale + halfLens;

    this.clonedContent.style.transform = `translate(${rx}px, ${ry}px) scale(${this.zoomScale})`;
  }

  toggleAltoContraste() {
    this.altoContrasteActivo = !this.altoContrasteActivo;
    if (this.altoContrasteActivo) {
      // Un contraste más alto y ligeramente desaturado/saturado dependiendo de la preferencia para mejorar legibilidad general
      document.body.style.filter = "contrast(1.4) saturate(1.3) brightness(0.95)";
    } else {
      document.body.style.filter = "none";
    }
  }

  toggleNotificaciones() {
    this.mostrarNotificaciones = !this.mostrarNotificaciones;
    if (this.mostrarMenuPerfil) this.mostrarMenuPerfil = false;
  }

  marcarTodoLeido() {
    this.notifService.markAllAsRead();
  }

  limpiarNotificaciones() {
    this.notifService.clearAll();
  }

  toggleSidebar() {
    this.sidebarAbierto = !this.sidebarAbierto;
  }

  cerrarSidebarMobile() {
    if (window.innerWidth < 768) {
      this.sidebarAbierto = false;
    }
  }

  toggleMenuPerfil() {
    this.mostrarMenuPerfil = !this.mostrarMenuPerfil;
    if (this.mostrarNotificaciones) this.mostrarNotificaciones = false;
  }

  actualizarBusquedaGlobal(event: Event) {
    const input = event.target as HTMLInputElement;
    this.dataService.setBusquedaGlobal(input.value);
  }

  toggleRegister() {
    this.isRegistering = !this.isRegistering;
  }

  doRegister() {
    if (!this.loginData.nombre || !this.loginData.email || !this.loginData.password) {
      Swal.fire('Oops...', 'Por favor completa todos los campos', 'warning');
      return;
    }

    this.isSubmitting = true;

    if (this.loginData.nombre) {
      this.dataService.setNombreAdmin(this.loginData.nombre);
    }

    const payload = {
      nombre: this.loginData.nombre,
      email: this.loginData.email,
      password: this.loginData.password
    };

    this.authService.register(payload).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: '¡Administrador Creado!',
          text: 'Usuario guardado correctamente en la base de datos.',
          confirmButtonColor: '#4A2B65'
        });
        this.isRegistering = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'error',
          title: 'Error de Registro',
          text: err.error?.message || 'No se pudo registrar el usuario en el backend.',
          confirmButtonColor: '#4A2B65'
        });
      }
    });
  }

  doLogin() {
    if (!this.loginData.email || !this.loginData.password) {
      Swal.fire('Oops...', 'Ingresa tu correo y contraseña', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.authService.login(this.loginData).subscribe({
      next: (res) => {
        this.isSubmitting = false;
        this.isLoggedIn = true;
        this.loadUserProfile(); 
        this.iniciarPollingNotificaciones();
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Conectado correctamente con el servidor',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'error',
          title: 'No se puede recuperar la información',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true
        });
      }
    });
  }

  toggleForgotPassword() {
    this.isForgotPasswordMode = !this.isForgotPasswordMode;
    this.isRegistering = false;
  }

  doForgotPassword() {
    if (!this.loginData.email) {
      Swal.fire('Atención', 'Ingresa tu correo para recibir el enlace', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.authService.forgotPassword(this.loginData.email).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Correo Enviado',
          text: 'Revisa tu bandeja de entrada para restablecer tu contraseña.',
          confirmButtonColor: '#4A2B65'
        });
        this.isForgotPasswordMode = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire('Error', 'No pudimos procesar tu solicitud. Verifica tu correo.', 'error');
      }
    });
  }

  doResetPassword() {
    if (!this.newPassword) {
      Swal.fire('Atención', 'Ingresa una nueva contraseña', 'warning');
      return;
    }

    this.isSubmitting = true;
    this.authService.resetPassword({
      token: this.resetToken,
      newPassword: this.newPassword
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        Swal.fire({
          icon: 'success',
          title: 'Contraseña Actualizada',
          text: 'Ya puedes iniciar sesión con tu nueva clave.',
          confirmButtonColor: '#4A2B65'
        });
        this.isResetPasswordMode = false;
        this.newPassword = '';
      },
      error: (err) => {
        this.isSubmitting = false;
        Swal.fire('Error', err.error?.message || 'Token inválido o expirado.', 'error');
      }
    });
  }


  doLogout() {
    this.mostrarMenuPerfil = false;
    this.isLoggedIn = false;
    this.loginData.password = '';
    
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.authService.logout();
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: 'info',
      title: 'Sesión cerrada exitosamente',
      showConfirmButton: false,
      timer: 3000
    });
  }

  async configTelefono() {
    this.mostrarMenuPerfil = false;
    const numeroGuardado = localStorage.getItem('whatsapp_phone') || '';

    const { value: telefono } = await Swal.fire({
      title: 'Vincular WhatsApp',
      input: 'text',
      inputValue: numeroGuardado,
      inputLabel: 'Ingresa tu número de teléfono con código de área',
      inputPlaceholder: 'Ej: +54 9 11 1234 5678',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3b82f6',
      inputValidator: (value) => {
        if (!value) {
          return '¡Necesitas escribir un número de teléfono!'
        }
        return null;
      }
    });

    if (telefono) {
      const telefonoFormateado = new PhonePipe().transform(telefono);

      localStorage.setItem('whatsapp_phone', telefonoFormateado);
      Swal.fire('Guardado', `Tu número ${telefonoFormateado} ha sido vinculado correctamente para los envíos de WhatsApp.`, 'success');
    }
  }
}
