import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { ProductoService } from 'src/app/Servicios/Productos/producto.service';

/**
 * Ventana emergente con el PDF del arte de un item (carpeta de artes de Aseguramiento de la Calidad, `{item}.pdf`).
 * Se usa desde Crear OT y desde Buscar OT: `<app-arte-item #arte></app-arte-item>` y `arte.abrir(item)`.
 * Permite verlo en la ventana o abrirlo en otra pestaña.
 */
@Component({
  selector: 'app-arte-item',
  templateUrl: './ArteItem.component.html',
})
export class ArteItemComponent implements OnDestroy {

  visible: boolean = false;
  cargando: boolean = false;
  item: number | null = null;
  /** Mensaje cuando el item no tiene arte o no se pudo consultar. */
  error: string | null = null;
  /** URL segura del PDF para el iframe. */
  urlSegura: SafeResourceUrl | null = null;
  private url: string | null = null;
  private consulta?: Subscription;

  constructor(private productoService: ProductoService, private sanitizer: DomSanitizer) { }

  /**
   * Abre la ventana y consulta el arte del item.
   * @param item Número del item (Prod_Id).
   * @returns No retorna un valor.
   */
  abrir(item: number | string | null | undefined) {
    const numero = Number(`${item ?? ''}`.trim());
    this.liberar();
    this.visible = true;
    this.error = null;
    if (!Number.isInteger(numero) || numero <= 0) {
      this.item = null;
      this.error = 'Primero cargue o seleccione un item.';
      return;
    }
    this.item = numero;
    this.cargando = true;
    this.consulta = this.productoService.GetArteItem(numero).subscribe({
      next: pdf => {
        this.url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
        this.urlSegura = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
        this.cargando = false;
      },
      error: async (error: HttpErrorResponse) => {
        this.error = await this.mensajeError(numero, error);
        this.cargando = false;
      },
    });
  }

  /** Abre el PDF en otra pestaña del navegador. */
  abrirEnPestana() {
    if (this.url) window.open(this.url, '_blank');
  }

  /** Al cerrar la ventana libera el PDF de memoria. */
  cerrar() {
    this.liberar();
  }

  ngOnDestroy() {
    this.liberar();
  }

  private liberar() {
    this.consulta?.unsubscribe();
    if (this.url) URL.revokeObjectURL(this.url);
    this.url = null;
    this.urlSegura = null;
    this.cargando = false;
  }

  /**
   * Arma el mensaje de error: la API responde ProblemDetails, pero al pedir un blob llega como Blob.
   * @param item Número del item.
   * @param error Error HTTP.
   * @returns Texto para mostrar en la ventana.
   */
  private async mensajeError(item: number, error: HttpErrorResponse): Promise<string> {
    if (error.status === 404) return `El item ${item} no tiene arte cargado en la carpeta de artes de Aseguramiento de la Calidad.`;
    try {
      const texto = error.error instanceof Blob ? await error.error.text() : '';
      const detalle = texto ? JSON.parse(texto)?.detail : null;
      if (detalle) return detalle;
    } catch { /* respuesta sin ProblemDetails */ }
    return `No fue posible consultar el arte del item ${item} (código ${error.status || 'sin conexión'}).`;
  }
}
