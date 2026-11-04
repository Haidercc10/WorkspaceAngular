import { MessageService } from 'primeng/api';

/**
 * Muestra mensajes de confirmación (p-toast fijos) que también se responden con el teclado:
 * Enter ejecuta "Sí" y Esc equivale a "No".
 *
 * Mientras la confirmación está abierta escucha el teclado en fase de captura, así Enter y Esc no llegan
 * al control que abrió el mensaje (que volvería a abrirlo) ni a un p-dialog contenedor (que se cerraría con Esc).
 * Los botones del toast deben cerrar con `cerrar(key)` y el componente debe llamar `destruir()` en ngOnDestroy.
 */
export class ConfirmacionTeclado {
  private actual: { key: string; aceptar: () => void } | null = null;
  private readonly alPresionarTecla = (event: KeyboardEvent) => this.manejarTecla(event);

  constructor(private messageService: MessageService) { }

  /**
   * Abre la confirmación reemplazando cualquier otra con la misma clave.
   * @param key Clave del p-toast.
   * @param summary Título del mensaje.
   * @param detail Texto del mensaje.
   * @param aceptar Acción del botón "Sí" (y de la tecla Enter).
   */
  mostrar(key: string, summary: string, detail: string, aceptar: () => void): void {
    (document.activeElement as HTMLElement | null)?.blur();
    if (this.actual) this.messageService.clear(this.actual.key);
    this.messageService.clear(key);
    this.actual = { key, aceptar };
    document.addEventListener('keydown', this.alPresionarTecla, true);
    this.messageService.add({ severity: 'warn', key, summary, detail, sticky: true });
  }

  /**
   * Cierra la confirmación de la clave indicada.
   * @param key Clave del p-toast.
   */
  cerrar(key: string): void {
    if (this.actual?.key === key) this.dejarDeEscuchar();
    this.messageService.clear(key);
  }

  /** Quita el listener de teclado; llamar en ngOnDestroy del componente. */
  destruir(): void {
    this.dejarDeEscuchar();
  }

  private dejarDeEscuchar(): void {
    this.actual = null;
    document.removeEventListener('keydown', this.alPresionarTecla, true);
  }

  /** Enter acepta y Esc cancela la confirmación abierta. */
  private manejarTecla(event: KeyboardEvent): void {
    if (!this.actual || (event.key !== 'Enter' && event.key !== 'Escape')) return;

    event.preventDefault();
    event.stopPropagation();
    const { key, aceptar } = this.actual;
    this.cerrar(key);
    if (event.key === 'Enter') aceptar();
  }
}
