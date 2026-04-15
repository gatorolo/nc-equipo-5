import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Cliente, Kpi, Trato, EtapaTrato, PipelineStage } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private apiUrl = 'https://crm-backend-cg74godk6q-uc.a.run.app/api';

  private clientesSubject = new BehaviorSubject<Cliente[]>([]);
  public clientes$ = this.clientesSubject.asObservable();

  private busquedaGlobalSubject = new BehaviorSubject<string>('');
  public busquedaGlobal$ = this.busquedaGlobalSubject.asObservable();

  private avatarAdminSubject = new BehaviorSubject<string>(''); 
  public avatarAdmin$ = this.avatarAdminSubject.asObservable();

  private nombreAdminSubject = new BehaviorSubject<string>('Administrador');
  public nombreAdmin$ = this.nombreAdminSubject.asObservable();

  private tratosSubject = new BehaviorSubject<Trato[]>([]);
  public tratos$ = this.tratosSubject.asObservable();

  constructor(private http: HttpClient) { 
    this.refreshClientes();
    this.refreshTratos();
  }

  refreshClientes() {
    this.http.get<Cliente[]>(`${this.apiUrl}/clientes`).subscribe({
      next: data => this.clientesSubject.next(data),
      error: err => {
        console.error('Error al cargar clientes:', err);
        if (err.status === 403) {
          console.warn('⚠️ Acceso Prohibido (403): Revisa si el backend fue reiniciado tras los cambios de seguridad.');
        }
      }
    });
  }

  getClientes(): Observable<Cliente[]> {
    return this.clientes$;
  }

  addCliente(nuevoCliente: Cliente): Observable<Cliente> {
    return this.http.post<Cliente>(`${this.apiUrl}/clientes`, nuevoCliente).pipe(
      tap(() => this.refreshClientes())
    );
  }

  updateCliente(actualizado: Cliente): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/clientes/${actualizado.id}`, actualizado).pipe(
      tap(() => this.refreshClientes())
    );
  }

  deleteCliente(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clientes/${id}`).pipe(
      tap(() => this.refreshClientes())
    );
  }

  refreshTratos() {
    this.http.get<Trato[]>(`${this.apiUrl}/tratos`).subscribe({
      next: data => this.tratosSubject.next(data),
      error: err => {
        console.error('Error al cargar tratos:', err);
        if (err.status === 403) {
          console.warn('⚠️ Acceso Prohibido (403): Posible desajuste de sesión o CORS.');
        }
      }
    });
  }

  getTratos(): Observable<Trato[]> {
    return this.tratos$;
  }

  addTrato(nuevo: Trato): Observable<Trato> {
    return this.http.post<Trato>(`${this.apiUrl}/tratos`, nuevo).pipe(tap(() => this.refreshTratos()));
  }

  updateTratoEtapa(id: string, etapa: EtapaTrato): Observable<Trato> {
    return this.http.put<Trato>(`${this.apiUrl}/tratos/${id}/etapa`, { etapa }).pipe(tap(() => this.refreshTratos()));
  }

  deleteTrato(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tratos/${id}`, { responseType: 'text' }).pipe(tap(() => this.refreshTratos()));
  }

  getDashboardAnalytics(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics/dashboard`);
  }

  getKpis(): Observable<Kpi[]> {
    return this.http.get<Kpi[]>(`${this.apiUrl}/kpis`);
  }

  setBusquedaGlobal(term: string) {
    this.busquedaGlobalSubject.next(term);
  }

  setAvatarAdmin(avatar: string) {
    this.avatarAdminSubject.next(avatar);
  }

  setNombreAdmin(nombre: string) {
    this.nombreAdminSubject.next(nombre);
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/admin/profile`);
  }

  updateProfile(perfil: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/profile`, perfil);
  }

  getCompany(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/company`);
  }

  updateCompany(empresa: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/company`, empresa);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/change-password`, { currentPassword, newPassword });
  }

  // --- Pipeline Stages ---
  getPipelineStages(): Observable<PipelineStage[]> {
    return this.http.get<PipelineStage[]>(`${this.apiUrl}/pipeline/stages`);
  }

  savePipelineStage(stage: PipelineStage): Observable<PipelineStage> {
    return this.http.post<PipelineStage>(`${this.apiUrl}/pipeline/stages`, stage);
  }

  deletePipelineStage(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/pipeline/stages/${id}`);
  }

  // --- Uploads ---
  uploadAvatar(file: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload/avatar`, formData);
  }

  // --- Notifications / Email ---
  enviarEmail(payload: { to: string; subject: string; body: string }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notifications/email`, payload);
  }
}
