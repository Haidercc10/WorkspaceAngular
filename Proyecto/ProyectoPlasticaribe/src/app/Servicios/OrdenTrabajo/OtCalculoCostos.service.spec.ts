import { EntradaCostosOT, OtCalculoCostosService, REGLA_PESO_MILLAR_D2 } from './OtCalculoCostos.service';

describe('OtCalculoCostosService', () => {
  let servicio: OtCalculoCostosService;

  /**
   * Arma una entrada de cálculo con valores por defecto.
   * @param cambios Valores que reemplazan a los de por defecto.
   * @returns Entrada de cálculo.
   */
  const entrada = (cambios: Partial<EntradaCostosOT> = {}): EntradaCostosOT => ({
    presentacion: 'Kg',
    cantidad: 1000,
    precio: 5000,
    margenAdicional: 10,
    pesoMillar: 20,
    tipoProducto: 'BOLSA',
    cantidadPaquete: 100,
    cantidadBulto: 0,
    ...cambios,
  });

  const paquete = (cambios: Partial<EntradaCostosOT> = {}) =>
    entrada({ presentacion: 'Paquete', cantidad: 50, precio: 3000, pesoMillar: 20, cantidadPaquete: 100, ...cambios });

  const und = (cambios: Partial<EntradaCostosOT> = {}) =>
    entrada({ presentacion: 'Und', cantidad: 10000, precio: 50, margenAdicional: 5, pesoMillar: 8, ...cambios });

  beforeEach(() => servicio = new OtCalculoCostosService());

  describe('Kg', () => {
    it('calcula neto, margen, valor kg y valor OT', () => {
      const r = servicio.calcularCostos(entrada())!;
      expect(r.netoKg).toBeCloseTo(1100, 6);
      expect(r.margenKg).toBeCloseTo(100, 6);
      expect(r.valorKg).toBe(5000);
      expect(r.valorOt).toBe(5000000);
      expect(r.pesoPaquete).toBeNull();
      expect(r.pesoBulto).toBeNull();
    });

    it('con cantidad y precio en 0 todo queda en 0', () => {
      const r = servicio.calcularCostos(entrada({ cantidad: 0, precio: 0 }))!;
      expect([r.netoKg, r.margenKg, r.valorKg, r.valorOt]).toEqual([0, 0, 0, 0]);
    });
  });

  describe('Paquete', () => {
    it('caso normal', () => {
      const r = servicio.calcularCostos(paquete())!;
      expect(r.pesoPaquete).toBeCloseTo(2, 6);
      expect(r.netoKg).toBeCloseTo(110, 6);
      expect(r.margenKg).toBeCloseTo(10, 6);
      expect(r.valorKg).toBeCloseTo(1500, 6);
      expect(r.valorOt).toBe(150000);
      expect(r.sinPesoParaValorKg).toBeFalse();
    });

    ['LAMINADO', 'HOJA'].forEach(tipo => it(`${tipo} divide el Peso Millar entre 2 (D2)`, () => {
      const r = servicio.calcularCostos(paquete({ tipoProducto: tipo }))!;
      expect(r.pesoMillarEfectivo).toBe(10);
      expect(r.pesoPaquete).toBeCloseTo(1, 6);
      expect(r.netoKg).toBeCloseTo(55, 6);
      expect(r.margenKg).toBeCloseTo(5, 6);
      expect(r.valorKg).toBeCloseTo(3000, 6);
    }));

    it('LAMINADO calculado varias veces da siempre el mismo resultado y no modifica la entrada', () => {
      const datos = Object.freeze(paquete({ tipoProducto: 'LAMINADO' }));
      const primero = servicio.calcularCostos(datos);
      for (let i = 0; i < 4; i++) expect(servicio.calcularCostos(datos)).toEqual(primero);
      expect(datos.pesoMillar).toBe(20);
    });

    it('con Peso Millar 0 el valor kg es 0 y se avisa (nunca Infinity)', () => {
      const r = servicio.calcularCostos(paquete({ pesoMillar: 0 }))!;
      expect(r.valorKg).toBe(0);
      expect(r.pesoPaquete).toBe(0);
      expect(r.valorOt).toBe(150000);
      expect(r.sinPesoParaValorKg).toBeTrue();
    });

    it('con Peso Millar null o undefined se comporta como 0', () => {
      [null, undefined].forEach(pesoMillar => {
        const r = servicio.calcularCostos(paquete({ pesoMillar: pesoMillar as any }))!;
        expect(r.valorKg).toBe(0);
        expect(r.netoKg).toBe(0);
        expect(r.sinPesoParaValorKg).toBeTrue();
      });
    });

    it('con Peso Millar 0 y precio 0 no da NaN', () => {
      const r = servicio.calcularCostos(paquete({ pesoMillar: 0, precio: 0 }))!;
      expect(r.valorKg).toBe(0);
      expect(r.valorOt).toBe(0);
    });

    it('con cantidad por paquete 0 el valor kg, el peso del paquete y del bulto quedan en 0', () => {
      const r = servicio.calcularCostos(paquete({ cantidadPaquete: 0, cantidadBulto: 10 }))!;
      expect(r.valorKg).toBe(0);
      expect(r.pesoPaquete).toBe(0);
      expect(r.pesoBulto).toBe(0);
      expect(r.sinPesoParaValorKg).toBeTrue();
    });

    it('peso del bulto = peso del paquete × cantidad por bulto', () => {
      const r = servicio.calcularCostos(paquete({ cantidadBulto: 10 }))!;
      expect(r.pesoBulto).toBeCloseTo(20, 6);
    });
  });

  describe('Und', () => {
    it('caso normal', () => {
      const r = servicio.calcularCostos(und())!;
      expect(r.valorOt).toBe(500000);
      expect(r.netoKg).toBeCloseTo(84, 6);
      expect(r.margenKg).toBeCloseTo(4, 6);
      expect(r.valorKg).toBeCloseTo(6250, 6);
      expect(r.pesoPaquete).toBeNull();
      expect(r.sinPesoParaValorKg).toBeFalse();
    });

    it('D1: con precio 0 el valor OT es 0 (no se fuerza a 1)', () => {
      const r = servicio.calcularCostos(und({ precio: 0 }))!;
      expect(r.valorOt).toBe(0);
      expect(r.valorKg).toBe(0);
    });

    it('D1: con cantidad 0 el valor OT y el valor kg son 0', () => {
      const r = servicio.calcularCostos(und({ cantidad: 0 }))!;
      expect(r.valorOt).toBe(0);
      expect(r.valorKg).toBe(0);
      expect(r.netoKg).toBe(0);
    });

    it('con Peso Millar 0 conserva el valor OT, valor kg 0 y avisa', () => {
      const r = servicio.calcularCostos(und({ pesoMillar: 0 }))!;
      expect(r.valorOt).toBe(500000);
      expect(r.valorKg).toBe(0);
      expect(r.sinPesoParaValorKg).toBeTrue();
    });

    it('LAMINADO no divide el Peso Millar en Und (D2, opción B)', () => {
      const r = servicio.calcularCostos(und({ tipoProducto: 'LAMINADO' }))!;
      expect(r.pesoMillarEfectivo).toBe(8);
      expect(r.netoKg).toBeCloseTo(84, 6);
      expect(r.valorKg).toBeCloseTo(6250, 6);
    });
  });

  describe('pesoMillarEfectivo', () => {
    it('solo aplica la regla a los tipos y presentaciones configurados', () => {
      expect(REGLA_PESO_MILLAR_D2.presentaciones).toEqual(['Paquete']);
      expect(servicio.pesoMillarEfectivo(20, 'HOJA', 'Paquete')).toBe(10);
      expect(servicio.pesoMillarEfectivo(20, 'laminado', 'Paquete')).toBe(20);
      expect(servicio.pesoMillarEfectivo(20, 'SIN FORMATO', 'Paquete')).toBe(20);
      expect(servicio.pesoMillarEfectivo(20, null, 'Paquete')).toBe(20);
      expect(servicio.pesoMillarEfectivo(20, 'LAMINADO', 'Kg')).toBe(20);
    });
  });

  describe('MTS', () => {
    const mts = (cambios: Partial<EntradaCostosOT> = {}) =>
      entrada({ presentacion: 'MTS', cantidad: 2500, precio: 120, margenAdicional: 10, ...cambios });

    it('Valor Unidad = precio, Cantidad = cantidad y Valor OT = cantidad × precio', () => {
      const r = servicio.calcularCostos(mts())!;
      expect(r.cantidadProducto).toBe(2500);
      expect(r.valorProducto).toBe(120);
      expect(r.valorOt).toBe(300000);
    });

    it('no calcula Valor Kg (por definir): devuelve null; Neto Kg y Margen Kg en 0', () => {
      const r = servicio.calcularCostos(mts({ tipoProducto: 'LAMINADO', pesoMillar: 0 }))!;
      expect(r.valorKg).toBeNull();
      expect(r.netoKg).toBe(0);
      expect(r.margenKg).toBe(0);
      expect(r.sinPesoParaValorKg).toBeFalse();
      expect(r.pesoPaquete).toBeNull();
    });

    it('con precio o cantidad en 0 el Valor OT es 0', () => {
      expect(servicio.calcularCostos(mts({ precio: 0 }))!.valorOt).toBe(0);
      expect(servicio.calcularCostos(mts({ cantidad: 0 }))!.valorOt).toBe(0);
    });
  });

  it('presentaciones sin regla de cálculo (Rollo) devuelven null', () => {
    expect(servicio.calcularCostos(entrada({ presentacion: 'Rollo' }))).toBeNull();
  });

  it('acepta números en texto con el mismo resultado', () => {
    const numeros = servicio.calcularCostos(paquete());
    const textos = servicio.calcularCostos(paquete({ cantidad: '50', precio: '3000', margenAdicional: '10', pesoMillar: '20', cantidadPaquete: '100' }));
    expect(textos).toEqual(numeros);
  });

  describe('peso del producto', () => {
    const dimensiones = { ancho: 10, largo: 20, fuelle: 5, calibre: 2 };

    it('usa el factor según unidad y material', () => {
      expect(servicio.factorPesoMaterial('Cms', 3)).toBe(0.0048);
      expect(servicio.factorPesoMaterial('Cms', 1)).toBe(0.00468);
      expect(servicio.factorPesoMaterial('Plgs', 3)).toBe(0.0317);
      expect(servicio.factorPesoMaterial('Plgs', 1)).toBe(0.0302);
      expect(servicio.calcularPesoProducto(dimensiones, 'Cms', 3)).toBeCloseTo(10 * 25 * 2 * 0.0048 / 1000, 10);
      expect(servicio.calcularPesoProducto(dimensiones, 'Plgs', 1)).toBeCloseTo(10 * 25 * 2 * 0.0302 / 1000, 10);
    });

    it('devuelve null si la unidad de extrusión no es Cms ni Plgs', () => {
      expect(servicio.calcularPesoProducto(dimensiones, '', 1)).toBeNull();
      expect(servicio.factorPesoMaterial('Mts', 1)).toBeNull();
    });
  });

  it('valoresNoFinitos detecta null, vacío, NaN e Infinity y acepta texto numérico', () => {
    expect(servicio.valoresNoFinitos({ a: 1, b: Infinity, c: NaN, d: null, e: '5', f: '' })).toEqual(['b', 'c', 'd', 'f']);
  });

  it('valoresNoFinitos detecta texto no numérico, solo espacios, undefined y -Infinity', () => {
    expect(servicio.valoresNoFinitos({ a: 'abc', b: ' ', c: undefined, d: -Infinity, e: 0, f: '-3.5' })).toEqual(['a', 'b', 'c', 'd']);
  });

  it('valoresNegativos detecta números y textos negativos; ignora 0, positivos, vacíos y no numéricos', () => {
    expect(servicio.valoresNegativos({ a: -1, b: '-0.5', c: 0, d: 10, e: null, f: '', g: ' ', h: 'abc', i: -Infinity, j: '3' }))
      .toEqual(['a', 'b', 'i']);
  });

  it('valoresNegativos sin negativos devuelve vacío', () => {
    expect(servicio.valoresNegativos({ cantidad: 1000, precio: 50.5, margen: 0, cantidadPaquete: 100, cantidadBulto: 10 })).toEqual([]);
  });

  it('una cantidad no numérica produce valores que valoresNoFinitos detecta (el guardado se bloquea)', () => {
    const r = servicio.calcularCostos(paquete({ cantidad: 'abc' }))!;
    expect(servicio.valoresNoFinitos({ neto: r.netoKg, valorOt: r.valorOt, cantidad: r.cantidadProducto })).toEqual(['neto', 'valorOt', 'cantidad']);
  });

  /**
   * Caracterización: reproduce las fórmulas del componente en 338f7233 (antes de PR2) para el primer cálculo con
   * ArrayProducto recién cargado: `pesoMillarComponente` es el Peso Millar base (this.pesoMillar) y `pesoMillarArreglo`
   * el de ArrayProducto ya dividido entre 2 si el tipo es LAMINADO/HOJA (la división se hacía en todas las presentaciones).
   */
  describe('caracterización frente a las fórmulas anteriores (338f7233)', () => {
    interface CasoLegado { presentacion: string; cant: number; precio: number; margen: number; pm: number; tipo: string; cp: number; cb: number; pesoProducto: number; }

    /**
     * Fórmulas anteriores de calcularCostosOT_Kg, _Paquete y _Und (primer cálculo, pesoPaquete/pesoBulto/valorKg previos en 0).
     * @param c Datos del caso.
     * @returns Valores que calculaba el componente.
     */
    const legado = (c: CasoLegado) => {
      const pesoMillarComponente = c.pm;
      const pesoMillarArreglo = (c.tipo == 'LAMINADO' || c.tipo == 'HOJA') ? c.pm / 2 : c.pm;
      const r: any = { pesoPaquete: 0, pesoBulto: 0, valorKg: 0 };
      if (c.presentacion == 'Kg') {
        r.cantidadProducto = c.cant;
        r.margenKg = c.margen * (c.cant / 100);
        r.netoKg = c.cant + ((c.cant * c.margen) / 100);
        r.valorKg = c.precio;
        r.valorProducto = c.precio;
        r.valorOt = c.cant * r.valorProducto;
      } else if (c.presentacion == 'Paquete') {
        r.cantidadProducto = c.cant;
        r.valorProducto = c.precio;
        r.margenKg = c.margen * (((c.cant * c.cp * pesoMillarArreglo) / 1000) / 100);
        r.netoKg = ((1 + (c.margen / 100)) * ((pesoMillarArreglo / 1000) * (c.cant * c.cp)));
        r.valorOt = c.cant * c.precio;
        if (pesoMillarArreglo > 0 && c.cp > 0) r.pesoPaquete = pesoMillarArreglo * (c.cp / 1000);
        if (c.cp > 0) r.pesoBulto = r.pesoPaquete * c.cb;
        if (c.cp == 0) r.valorKg = 0;
        else r.valorKg = c.cp > 0 ? c.precio / r.pesoPaquete : 0;
      } else if (c.presentacion == 'Und') {
        r.cantidadProducto = c.cant;
        r.valorProducto = c.precio;
        r.valorOt = r.cantidadProducto * r.valorProducto;
        r.margenKg = (c.margen * ((c.cant * pesoMillarComponente) / 1000)) / 100;
        r.netoKg = ((1 + ((c.margen) / 100)) * ((pesoMillarComponente / 1000) * c.cant));
        if (c.pesoProducto > 0) {
          if (r.valorOt == 0) r.valorOt = 1;
          if ((c.cant * pesoMillarArreglo) / 1000 == 0) r.valorKg = 0;
          else r.valorKg = r.valorOt / ((c.cant * pesoMillarComponente) / 1000);
        } else r.valorOt = 0;
      }
      return r;
    };

    const aEntrada = (c: CasoLegado): EntradaCostosOT => ({
      presentacion: c.presentacion, cantidad: c.cant, precio: c.precio, margenAdicional: c.margen,
      pesoMillar: c.pm, tipoProducto: c.tipo, cantidadPaquete: c.cp, cantidadBulto: c.cb,
    });

    const casosNormales: CasoLegado[] = [
      { presentacion: 'Kg', cant: 1000, precio: 5000, margen: 10, pm: 20, tipo: 'BOLSA', cp: 0, cb: 0, pesoProducto: 1 },
      { presentacion: 'Kg', cant: 250.5, precio: 7300, margen: 0, pm: 0, tipo: 'LAMINADO', cp: 0, cb: 0, pesoProducto: 1 },
      { presentacion: 'Paquete', cant: 50, precio: 3000, margen: 10, pm: 20, tipo: 'BOLSA', cp: 100, cb: 10, pesoProducto: 1 },
      { presentacion: 'Paquete', cant: 12, precio: 4500, margen: 5, pm: 13.75, tipo: 'BOLSA', cp: 50, cb: 20, pesoProducto: 1 },
      { presentacion: 'Paquete', cant: 50, precio: 3000, margen: 10, pm: 20, tipo: 'LAMINADO', cp: 100, cb: 10, pesoProducto: 1 },
      { presentacion: 'Paquete', cant: 8, precio: 2100, margen: 3, pm: 9.5, tipo: 'HOJA', cp: 25, cb: 4, pesoProducto: 1 },
      { presentacion: 'Und', cant: 10000, precio: 50, margen: 5, pm: 8, tipo: 'BOLSA', cp: 0, cb: 0, pesoProducto: 0.5 },
      { presentacion: 'Und', cant: 3500, precio: 120.5, margen: 0, pm: 4.2, tipo: 'LAMINADO', cp: 0, cb: 0, pesoProducto: 0.5 },
    ];

    casosNormales.forEach(c => it(`${c.presentacion} ${c.tipo} (cant ${c.cant}, precio ${c.precio}, PM ${c.pm}) da lo mismo que antes`, () => {
      const anterior = legado(c);
      const actual = servicio.calcularCostos(aEntrada(c))!;
      ['cantidadProducto', 'valorProducto', 'margenKg', 'netoKg', 'valorKg', 'valorOt'].forEach(campo =>
        expect((actual as any)[campo]).withContext(campo).toBeCloseTo(anterior[campo], 8));
      if (c.presentacion == 'Paquete') {
        expect(actual.pesoPaquete!).toBeCloseTo(anterior.pesoPaquete, 8);
        expect(actual.pesoBulto!).toBeCloseTo(anterior.pesoBulto, 8);
      }
    }));

    // Valores negativos: el componente bloquea el guardado con entradas negativas (valoresNegativos); aquí se documenta
    // qué calcula el servicio con ellas frente a las fórmulas anteriores.
    it('negativos en Kg: mismas fórmulas que antes (valores negativos, sin bloqueo en el cálculo)', () => {
      const c: CasoLegado = { presentacion: 'Kg', cant: -100, precio: 5000, margen: 10, pm: 0, tipo: 'BOLSA', cp: 0, cb: 0, pesoProducto: 1 };
      const actual = servicio.calcularCostos(aEntrada(c))!;
      expect(actual.valorOt).toBe(legado(c).valorOt);
      expect(actual.netoKg).toBeCloseTo(legado(c).netoKg, 8);
      expect(actual.valorOt).toBe(-500000);
    });

    it('negativos en Und: Valor OT igual que antes; con cantidad negativa el Valor Kg ahora es 0 (antes era positivo)', () => {
      const c: CasoLegado = { presentacion: 'Und', cant: -10000, precio: 50, margen: 5, pm: 8, tipo: 'BOLSA', cp: 0, cb: 0, pesoProducto: 0.5 };
      const actual = servicio.calcularCostos(aEntrada(c))!;
      expect(actual.valorOt).toBe(legado(c).valorOt);
      expect(legado(c).valorKg).toBeCloseTo(6250, 8);
      expect(actual.valorKg).toBe(0);
      const precioNegativo = servicio.calcularCostos(aEntrada({ ...c, cant: 10000, precio: -50 }))!;
      expect(precioNegativo.valorKg).toBeCloseTo(-6250, 8);
    });

    it('negativos en Paquete: con Peso Millar negativo el Valor Kg ahora es 0 (antes era Infinity)', () => {
      const c: CasoLegado = { presentacion: 'Paquete', cant: 50, precio: 3000, margen: 10, pm: -20, tipo: 'BOLSA', cp: 100, cb: 10, pesoProducto: 1 };
      expect(legado(c).valorKg).toBe(Infinity);
      const actual = servicio.calcularCostos(aEntrada(c))!;
      expect(actual.valorKg).toBe(0);
      expect(actual.sinPesoParaValorKg).toBeTrue();
      expect(actual.netoKg).toBeCloseTo(legado(c).netoKg, 8);
    });
  });
});
