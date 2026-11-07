import { Injectable } from '@angular/core';

/**
 * Regla D2 (aprobada por el responsable, opción B): para los tipos de producto LAMINADO y HOJA, el Peso Millar
 * se divide entre 2 antes de calcular los costos, solo en la presentación Paquete (Und, Kg y MTS no lo aplican).
 * La división se hace sobre una variable local; el Peso Millar del producto no se modifica.
 */
export const REGLA_PESO_MILLAR_D2: Readonly<{ tipos: readonly string[]; divisor: number; presentaciones: readonly string[] }> = {
  tipos: ['LAMINADO', 'HOJA'],
  divisor: 2,
  presentaciones: ['Paquete'],
};

/** Datos de entrada para calcular los costos de una OT. Ningún valor se modifica durante el cálculo. */
export interface EntradaCostosOT {
  /** Presentación de la OT (Kg, Paquete, Und, ...). */
  presentacion: string;
  /** Cantidad pedida en la presentación de la OT. */
  cantidad: number | string | null;
  /** Precio por unidad de la presentación (por kg en Kg, por paquete en Paquete, por unidad en Und). */
  precio: number | string | null;
  /** Margen adicional en porcentaje. */
  margenAdicional: number | string | null;
  /** Peso Millar base del producto, sin aplicar la regla D2. */
  pesoMillar: number | string | null;
  /** Tipo o formato del producto (p. ej. LAMINADO, HOJA). */
  tipoProducto: string | null;
  /** Cantidad de bolsas por paquete. */
  cantidadPaquete: number | string | null;
  /** Cantidad de paquetes por bulto. */
  cantidadBulto: number | string | null;
}

/** Resultado del cálculo de costos de una OT. */
export interface ResultadoCostosOT {
  cantidadProducto: number;
  valorProducto: number;
  margenKg: number;
  netoKg: number;
  /** Valor del kilo; null cuando la presentación no lo calcula (MTS: pendiente de definir) y quien llama decide qué valor usar. */
  valorKg: number | null;
  valorOt: number;
  /** Peso Millar usado en el cálculo (con la regla D2 aplicada si corresponde). */
  pesoMillarEfectivo: number;
  /** Peso del paquete en kg; null cuando la presentación no lo calcula (no se debe modificar el valor actual). */
  pesoPaquete: number | null;
  /** Peso del bulto en kg; null cuando la presentación no lo calcula (no se debe modificar el valor actual). */
  pesoBulto: number | null;
  /** true cuando Valor Kg quedó en 0 porque no hay peso con el cual dividir (Peso Millar o cantidad por paquete en 0). */
  sinPesoParaValorKg: boolean;
}

/** Dimensiones del producto usadas para calcular su peso. */
export interface DimensionesProductoOT {
  ancho: number | string | null;
  largo: number | string | null;
  fuelle: number | string | null;
  calibre: number | string | null;
}

/**
 * Cálculos de costos y pesos de la Orden de Trabajo. Todas las funciones son puras: no tienen estado,
 * no hacen consultas y no modifican sus argumentos, así que repetir un cálculo con los mismos datos
 * siempre da el mismo resultado.
 */
@Injectable({
  providedIn: 'root'
})
export class OtCalculoCostosService {

  /**
   * Convierte un valor a número tratando null, undefined y texto vacío como 0.
   * @param valor Valor numérico o texto numérico.
   * @returns El número equivalente (NaN si el texto no es numérico).
   */
  private aNumero(valor: unknown): number {
    return valor == null || valor === '' ? 0 : Number(valor);
  }

  /**
   * Calcula los costos de la OT según su presentación.
   * @param entrada Datos de la OT y del producto.
   * @returns Los costos calculados, o null si la presentación no tiene regla de cálculo (p. ej. Rollo),
   * en cuyo caso quien llama conserva los valores que ya tenía.
   */
  calcularCostos(entrada: EntradaCostosOT): ResultadoCostosOT | null {
    switch (entrada.presentacion) {
      case 'Kg': return this.calcularCostosKg(entrada);
      case 'Paquete': return this.calcularCostosPaquete(entrada);
      case 'Und': return this.calcularCostosUnd(entrada);
      case 'MTS': return this.calcularCostosMts(entrada);
      default: return null;
    }
  }

  /**
   * Costos de una OT en kilos: el precio es el valor del kilo y no interviene el peso del producto.
   * @param entrada Datos de la OT y del producto.
   * @returns Costos calculados; no calcula peso de paquete ni de bulto.
   */
  calcularCostosKg(entrada: EntradaCostosOT): ResultadoCostosOT {
    const cantidad = this.aNumero(entrada.cantidad);
    const precio = this.aNumero(entrada.precio);
    const margen = this.aNumero(entrada.margenAdicional);
    return {
      cantidadProducto: cantidad,
      valorProducto: precio,
      margenKg: margen * (cantidad / 100),
      netoKg: cantidad + ((cantidad * margen) / 100),
      valorKg: precio,
      valorOt: cantidad * precio,
      pesoMillarEfectivo: this.pesoMillarEfectivo(entrada.pesoMillar, entrada.tipoProducto, entrada.presentacion),
      pesoPaquete: null,
      pesoBulto: null,
      sinPesoParaValorKg: false,
    };
  }

  /**
   * Costos de una OT en paquetes. Valor Kg = precio del paquete / peso del paquete; si el paquete no tiene peso
   * (Peso Millar o cantidad por paquete en 0), Valor Kg = 0 y se marca `sinPesoParaValorKg`.
   * @param entrada Datos de la OT y del producto.
   * @returns Costos calculados, con el peso del paquete y del bulto.
   */
  calcularCostosPaquete(entrada: EntradaCostosOT): ResultadoCostosOT {
    const cantidad = this.aNumero(entrada.cantidad);
    const precio = this.aNumero(entrada.precio);
    const margen = this.aNumero(entrada.margenAdicional);
    const cantidadPaquete = this.aNumero(entrada.cantidadPaquete);
    const cantidadBulto = this.aNumero(entrada.cantidadBulto);
    const pesoMillar = this.pesoMillarEfectivo(entrada.pesoMillar, entrada.tipoProducto, entrada.presentacion);
    const pesoPaquete = pesoMillar > 0 && cantidadPaquete > 0 ? pesoMillar * (cantidadPaquete / 1000) : 0;
    return {
      cantidadProducto: cantidad,
      valorProducto: precio,
      margenKg: margen * (((cantidad * cantidadPaquete * pesoMillar) / 1000) / 100),
      netoKg: (1 + (margen / 100)) * ((pesoMillar / 1000) * (cantidad * cantidadPaquete)),
      valorKg: pesoPaquete > 0 ? precio / pesoPaquete : 0,
      valorOt: cantidad * precio,
      pesoMillarEfectivo: pesoMillar,
      pesoPaquete,
      pesoBulto: pesoPaquete * cantidadBulto,
      sinPesoParaValorKg: !(pesoPaquete > 0),
    };
  }

  /**
   * Costos de una OT en unidades. D1: Valor OT = cantidad × precio siempre; el peso solo interviene en
   * Valor Kg = Valor OT / (cantidad × Peso Millar / 1000). Si ese divisor es 0, Valor Kg = 0, y si falta
   * el Peso Millar se marca `sinPesoParaValorKg`.
   * @param entrada Datos de la OT y del producto.
   * @returns Costos calculados; no calcula peso de paquete ni de bulto.
   */
  calcularCostosUnd(entrada: EntradaCostosOT): ResultadoCostosOT {
    const cantidad = this.aNumero(entrada.cantidad);
    const precio = this.aNumero(entrada.precio);
    const margen = this.aNumero(entrada.margenAdicional);
    const pesoMillar = this.pesoMillarEfectivo(entrada.pesoMillar, entrada.tipoProducto, entrada.presentacion);
    const valorOt = cantidad * precio;
    const kilos = (cantidad * pesoMillar) / 1000;
    return {
      cantidadProducto: cantidad,
      valorProducto: precio,
      margenKg: (margen * kilos) / 100,
      netoKg: (1 + (margen / 100)) * kilos,
      valorKg: kilos > 0 ? valorOt / kilos : 0,
      valorOt,
      pesoMillarEfectivo: pesoMillar,
      pesoPaquete: null,
      pesoBulto: null,
      sinPesoParaValorKg: !(pesoMillar > 0),
    };
  }

  /**
   * Costos de una OT en metros (decisión del responsable): Valor Unidad = precio ingresado, Cantidad = cantidad
   * ingresada y Valor OT = cantidad × precio. Neto Kg y Margen Kg no tienen regla para metros y quedan en 0, como antes.
   * TODO: Valor Kg MTS por definir (responsable). Mientras tanto no se calcula: se devuelve null y el componente
   * usa 0 en una OT nueva y conserva el Valor Kg guardado al editar.
   * @param entrada Datos de la OT y del producto.
   * @returns Costos calculados, con `valorKg` en null; no calcula peso de paquete ni de bulto.
   */
  calcularCostosMts(entrada: EntradaCostosOT): ResultadoCostosOT {
    const cantidad = this.aNumero(entrada.cantidad);
    const precio = this.aNumero(entrada.precio);
    return {
      cantidadProducto: cantidad,
      valorProducto: precio,
      margenKg: 0,
      netoKg: 0,
      valorKg: null,
      valorOt: cantidad * precio,
      pesoMillarEfectivo: this.pesoMillarEfectivo(entrada.pesoMillar, entrada.tipoProducto, entrada.presentacion),
      pesoPaquete: null,
      pesoBulto: null,
      sinPesoParaValorKg: false,
    };
  }

  /**
   * Aplica la regla D2 (`REGLA_PESO_MILLAR_D2`) al Peso Millar base sin modificar el dato original.
   * @param pesoMillar Peso Millar base del producto.
   * @param tipoProducto Tipo o formato del producto (comparación exacta, como hasta ahora).
   * @param presentacion Presentación de la OT.
   * @returns Peso Millar que se usa en los cálculos.
   */
  pesoMillarEfectivo(pesoMillar: number | string | null, tipoProducto: string | null, presentacion: string): number {
    const base = this.aNumero(pesoMillar);
    const aplica = REGLA_PESO_MILLAR_D2.tipos.includes(tipoProducto ?? '') && REGLA_PESO_MILLAR_D2.presentaciones.includes(presentacion);
    return aplica ? base / REGLA_PESO_MILLAR_D2.divisor : base;
  }

  /**
   * Factor de peso según la unidad de extrusión y el material (3 usa un factor distinto).
   * @param unidadExtrusion Unidad de medida de extrusión (Cms o Plgs).
   * @param material Id del material de extrusión.
   * @returns El factor, o null si la unidad no es Cms ni Plgs.
   */
  factorPesoMaterial(unidadExtrusion: string, material: number | string | null): number | null {
    const esMaterial3 = this.aNumero(material) === 3;
    if (unidadExtrusion == 'Cms') return esMaterial3 ? 0.0048 : 0.00468;
    if (unidadExtrusion == 'Plgs') return esMaterial3 ? 0.0317 : 0.0302;
    return null;
  }

  /**
   * Peso del producto = Ancho × (Largo + Fuelle) × Calibre × factor / 1000.
   * @param dimensiones Dimensiones del producto.
   * @param unidadExtrusion Unidad de medida de extrusión (Cms o Plgs).
   * @param material Id del material de extrusión.
   * @returns El peso del producto, o null si la unidad de extrusión no es Cms ni Plgs.
   */
  calcularPesoProducto(dimensiones: DimensionesProductoOT, unidadExtrusion: string, material: number | string | null): number | null {
    const factor = this.factorPesoMaterial(unidadExtrusion, material);
    if (factor == null) return null;
    const ancho = this.aNumero(dimensiones.ancho);
    const largo = this.aNumero(dimensiones.largo);
    const fuelle = this.aNumero(dimensiones.fuelle);
    const calibre = this.aNumero(dimensiones.calibre);
    return ancho * (largo + fuelle) * calibre * factor / 1000;
  }

  /**
   * Revisa que los valores que se van a enviar sean números finitos (acepta texto numérico, como lo acepta la API).
   * @param valores Valores a revisar, por nombre.
   * @returns Los nombres de los valores nulos, vacíos (o solo espacios), no numéricos o infinitos; vacío si todos son válidos.
   */
  valoresNoFinitos(valores: Record<string, unknown>): string[] {
    return Object.keys(valores).filter(nombre => {
      const valor = valores[nombre];
      return valor == null || (typeof valor === 'string' && valor.trim() === '') || !Number.isFinite(Number(valor));
    });
  }
}
