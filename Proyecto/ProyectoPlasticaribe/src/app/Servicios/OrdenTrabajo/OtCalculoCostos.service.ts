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

/** Tolerancia (en porcentaje) del peso teórico que usa producción para el peso mínimo y máximo. */
export const TOLERANCIA_PESO_TEORICO: number = 7;

/** Peso teórico con su rango de tolerancia (± `TOLERANCIA_PESO_TEORICO`). */
export interface RangoPesoTeorico {
  pesoTeorico: number;
  pesoMinimo: number;
  pesoMaximo: number;
}

/** Datos de entrada para calcular el peso teórico con la fórmula de producción. */
export interface EntradaPesoTeorico {
  /** Presentación (Kg/Kilo, Und/Unidad o Paquete). */
  presentacion: string | null;
  /** Cantidad en la presentación (kilos, unidades o paquetes). */
  cantidad: number | string | null;
  /** Peso Millar del producto. */
  pesoMillar: number | string | null;
  /** Bolsas por paquete (solo se usa en Paquete). */
  cantidadPaquete: number | string | null;
}

/**
 * Paquetes por bulto que se usan para repartir el peso manual de CAMISILLA BIOD cuando todavía no se ha digitado la
 * cantidad de paquetes por bulto (el bulto completo queda en un solo paquete hasta que el usuario la indique).
 */
export const PAQUETES_PESO_MANUAL_BIOD: number = 1;

/**
 * Pesos teóricos manuales de producción para CAMISILLA BIOD (kg de un bulto completo), en el orden en que se evalúan (el primero
 * que coincide gana). La talla se compara como número, así que "T2", "T2." y "T2.0" son la misma. `x70` exige que la
 * referencia tenga "X 70" (por eso va antes que la fila general de T3.0). Las referencias de SUPER ESPECIAL sin valor
 * (todas menos T0.5) usan la fórmula.
 */
const PESOS_TEORICOS_CAMISILLA_BIOD: Readonly<Record<'superEspecial' | 'especial' | 'normal', readonly { talla: number; peso: number; x70?: boolean }[]>> = {
  superEspecial: [{ talla: 0.5, peso: 21 }],
  especial: [
    { talla: 0.5, peso: 17 }, { talla: 1, peso: 26 }, { talla: 1.5, peso: 33 }, { talla: 2, peso: 44 },
    { talla: 2.5, peso: 35 }, { talla: 3, peso: 26 }, { talla: 3.2, peso: 28 },
  ],
  normal: [
    { talla: 0.5, peso: 14 }, { talla: 1, peso: 21 }, { talla: 1.5, peso: 28 }, { talla: 2, peso: 35 },
    { talla: 2.5, peso: 30 }, { talla: 3, peso: 20, x70: true }, { talla: 3, peso: 23 },
  ],
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
  /** Bolsas por paquete editadas en sellado (las que se guardan como SelladoCorte_CantBolsasPaquete y usa el servidor, H-C), no las del producto. */
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
   * Peso teórico con la fórmula de producción (sellado): Kg = cantidad; Und = cantidad × Peso Millar / 1000;
   * Paquete = cantidad × Peso Millar × bolsas por paquete / 1000 (también con cantidad 1: la excepción de producción
   * para un solo paquete no se aplica, por decisión del responsable).
   * @param entrada Presentación, cantidad, Peso Millar y bolsas por paquete.
   * @returns Peso teórico en kg; 0 si la presentación no tiene regla (p. ej. Rollo o MTS).
   */
  calcularPesoTeorico(entrada: EntradaPesoTeorico): number {
    const cantidad = this.aNumero(entrada.cantidad);
    const pesoMillar = this.aNumero(entrada.pesoMillar);
    switch (`${entrada.presentacion ?? ''}`.trim()) {
      case 'Kg': case 'Kilo': return cantidad;
      case 'Und': case 'Unidad': return (cantidad * pesoMillar) / 1000;
      case 'Paquete': return (cantidad * pesoMillar * this.aNumero(entrada.cantidadPaquete)) / 1000;
      default: return 0;
    }
  }

  /**
   * Peso teórico manual de producción: solo existe para algunas referencias CAMISILLA BIOD y es un peso fijo
   * (no depende de la cantidad). Para el resto de referencias se usa la fórmula (`calcularPesoTeorico`).
   * @param formato Formato del producto terminado.
   * @param referencia Nombre del producto.
   * @returns El peso fijo en kg, o null si la referencia no tiene peso manual.
   */
  pesoTeoricoManual(formato: string | null, referencia: string | null): number | null {
    const nombre = `${referencia ?? ''}`.toUpperCase().replace(/\s+/g, ' ');
    const esCamisilla = `${formato ?? ''}`.toUpperCase().includes('CAMISILLA') || nombre.includes('CAMISILLA');
    if (!esCamisilla || !nombre.includes('BIOD')) return null;
    const tallas = this.tallasReferencia(nombre);
    if (tallas.length == 0) return null;
    const grupo = /SUPER\s*ESPECIAL/.test(nombre) ? 'superEspecial' : nombre.includes('ESPECIAL') ? 'especial' : 'normal';
    const x70 = /X\s*70\b/.test(nombre);
    const fila = PESOS_TEORICOS_CAMISILLA_BIOD[grupo].find(f => tallas.includes(f.talla) && (!f.x70 || x70));
    return fila ? fila.peso : null;
  }

  /**
   * Peso de un paquete de CAMISILLA BIOD según la tabla manual de producción. El peso de la tabla es el del bulto
   * completo y es fijo; el paquete es ese peso repartido entre los paquetes del bulto (T3.0: 23 kg con 2 paquetes =
   * 11,5 kg; T2.0: 35 kg con 10 paquetes = 3,5 kg). Sin paquetes por bulto se usan `PAQUETES_PESO_MANUAL_BIOD`.
   * @param formato Formato(s) del producto terminado.
   * @param referencia Nombre del producto.
   * @param paquetesBulto Cantidad de paquetes por bulto digitada en la OT.
   * @returns El peso del paquete en kg, o null si la referencia no tiene peso manual.
   */
  pesoPaqueteManual(formato: string | null, referencia: string | null, paquetesBulto: number | string | null): number | null {
    const manual = this.pesoTeoricoManual(formato, referencia);
    if (manual == null) return null;
    const paquetes = this.aNumero(paquetesBulto);
    return manual / (paquetes > 0 ? paquetes : PAQUETES_PESO_MANUAL_BIOD);
  }

  /**
   * Tallas que aparecen en la referencia ("T2", "T2.", "T2.0", "T 2,0", "T-2" → 2).
   * @param nombre Nombre del producto en mayúsculas.
   * @returns Las tallas como número.
   */
  private tallasReferencia(nombre: string): number[] {
    return Array.from(nombre.matchAll(/(?:^|[^A-Z0-9])T\s*-?\s*(\d+(?:[.,]\d+)?)/g), m => Number(m[1].replace(',', '.')));
  }

  /**
   * Rango de tolerancia de producción (± `TOLERANCIA_PESO_TEORICO` %) alrededor de un peso teórico.
   * @param pesoTeorico Peso teórico en kg.
   * @returns Peso teórico, mínimo y máximo.
   */
  rangoPesoTeorico(pesoTeorico: number | string | null): RangoPesoTeorico {
    const peso = this.aNumero(pesoTeorico) || 0;
    const tolerancia = (peso * TOLERANCIA_PESO_TEORICO) / 100;
    return { pesoTeorico: peso, pesoMinimo: peso - tolerancia, pesoMaximo: peso + tolerancia };
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
   * Revisa que las entradas de costos no sean negativas (no se permiten cantidades, precios ni márgenes negativos).
   * Los valores vacíos o no numéricos no se consideran negativos: los detecta `valoresNoFinitos`.
   * @param valores Valores a revisar, por nombre.
   * @returns Los nombres de los valores menores que 0; vacío si ninguno lo es.
   */
  valoresNegativos(valores: Record<string, unknown>): string[] {
    return Object.keys(valores).filter(nombre => {
      const valor = valores[nombre];
      if (valor == null || (typeof valor === 'string' && valor.trim() === '')) return false;
      return Number(valor) < 0;
    });
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
