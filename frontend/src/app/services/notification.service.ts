import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  date: Date;
  read: boolean;
  type: 'info' | 'success' | 'warning';
}

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export interface WhatsAppPayload {
  phone: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private apiUrl = 'https://crm-backend-cg74godk6q-uc.a.run.app/api';

  private notificationsSource = new BehaviorSubject<AppNotification[]>([]);
  public notifications$ = this.notificationsSource.asObservable();

  constructor(private http: HttpClient) { 
    // No cargar automáticamente aquí, esperar a que el componente decida cuándo (ej. tras login)
  }

  loadNotifications(): void {
    this.http.get<any[]>(`${this.apiUrl}/notifications`).subscribe({
      next: (data) => {
        const mapped: AppNotification[] = data.map(n => ({
          id: n.id.toString(),
          title: n.title,
          message: n.message,
          date: new Date(n.date),
          read: n.read,
          type: n.type
        }));
        this.notificationsSource.next(mapped);
      },
      error: (err) => console.error('Error cargando notificaciones', err)
    });
  }

  addNotification(title: string, message: string, type: 'info' | 'success' | 'warning' = 'info'): void {
    // Las notificaciones internas ahora vienen del backend. 
    // Este método solo se usa para feedback inmediato si es necesario, 
    // pero lo ideal es recargar desde el server.
    this.loadNotifications();
  }

  markAllAsRead(): void {
    this.http.put(`${this.apiUrl}/notifications/mark-all-read`, {}).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error('Error al marcar todo como leído', err)
    });
  }

  clearAll(): void {
    this.http.delete(`${this.apiUrl}/notifications`).subscribe({
      next: () => this.notificationsSource.next([]),
      error: (err) => console.error('Error al limpiar notificaciones', err)
    });
  }

  markAsRead(id: string): void {
    this.http.patch(`${this.apiUrl}/notifications/${id}/read`, {}).subscribe({
      next: () => this.loadNotifications(),
      error: (err) => console.error('Error al marcar notificación individual', err)
    });
  }

  playSuccessSound(): void {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // Sonido tipo "Campanita / Ding"
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(1567.98, audioCtx.currentTime); // G6 (tono agudo y claro)

      // Envolvente de volumen: ataque rápido y decaimiento largo
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.0);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 1.0);
    } catch (e) {
      console.warn('Audio no soportado o bloqueado por el navegador');
    }
  }


  sendEmail(payload: EmailPayload): Observable<any> {
    console.log('📬 Solicitud de envío de Email despachada al servidor:', payload);

    return this.http.post<any>(`${this.apiUrl}/notifications/email`, payload).pipe(
      tap(response => {
        console.log('✅ Email enviado vía servidor SMTP:', response);
        this.addNotification('Correo Enviado', `Se ha despachado el correo a: ${payload.to}`, 'success');
        this.playSuccessSound();
      })
    );
  }

  sendWhatsApp(payload: WhatsAppPayload): Observable<any> {
    console.log('💬 Solicitud de envío de WhatsApp despachada al servidor:', payload);

    return this.http.post<any>(`${this.apiUrl}/notifications/whatsapp`, payload).pipe(
      tap(response => {
        console.log('✅ WhatsApp registrado en servidor:', response);
        this.addNotification('WhatsApp Despachado', `Se ha procesado el envío hacia: ${payload.phone}`, 'success');
        this.playSuccessSound();
      })
    );
  }
}
