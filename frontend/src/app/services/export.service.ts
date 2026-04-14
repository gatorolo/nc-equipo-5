import { Injectable } from '@angular/core';
import { Cliente, Trato } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  exportarClientesCSV(clientes: Cliente[]): void {
    const encabezados = ['ID', 'Nombre', 'Empresa', 'Ciudad', 'Estado', 'Email', 'Teléfono', 'Última Interacción'];

    const filas: string[][] = clientes.map(cliente => [
      cliente.id !== undefined ? cliente.id.toString() : '',
      cliente.nombre,
      cliente.empresa,
      cliente.ciudad || '',
      cliente.estado,
      cliente.email || '',
      cliente.telefono || '',
      cliente.ultimaInteraccion
    ]);

    const csv = this.generarCSV(encabezados, filas);
    this.descargarArchivo(csv, 'clientes_sagrada_madre.csv');
  }

  exportarTratosCSV(tratos: Trato[]): void {
    const encabezados = ['ID', 'Nombre', 'Empresa', 'Etapa', 'Monto (USD)'];

    const filas: string[][] = tratos.map(trato => [
      trato.id || '',
      trato.nombre,
      trato.empresa,
      trato.etapa,
      trato.monto.toString()
    ]);

    const csv = this.generarCSV(encabezados, filas);
    this.descargarArchivo(csv, 'tratos_sagrada_madre.csv');
  }

  private generarCSV(encabezados: string[], filas: string[][]): string {
    const escaparCelda = (valor: string): string => {
      if (valor.includes(',') || valor.includes('"') || valor.includes('\n')) {
        return '"' + valor.replace(/"/g, '""') + '"';
      }
      return valor;
    };

    const lineas: string[] = [];
    lineas.push(encabezados.map(escaparCelda).join(','));

    for (const fila of filas) {
      lineas.push(fila.map(escaparCelda).join(','));
    }

    return lineas.join('\n');
  }

  private descargarArchivo(contenido: string, nombreArchivo: string): void {
    const bom = '\uFEFF';
    const blob = new Blob([bom + contenido], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    enlace.style.display = 'none';

    document.body.appendChild(enlace);
    enlace.click();

    document.body.removeChild(enlace);
    window.URL.revokeObjectURL(url);
  }
}
