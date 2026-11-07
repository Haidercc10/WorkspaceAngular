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

  it('presentaciones sin regla de cálculo (MTS, Rollo) devuelven null', () => {
    expect(servicio.calcularCostos(entrada({ presentacion: 'MTS' }))).toBeNull();
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
});
