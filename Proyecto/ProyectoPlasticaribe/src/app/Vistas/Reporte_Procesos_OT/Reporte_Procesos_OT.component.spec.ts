import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of } from 'rxjs';
import { BagproService } from 'src/app/Servicios/BagPro/Bagpro.service';
import { ClientesService } from 'src/app/Servicios/Clientes/clientes.service';
import { Detalle_BodegaRollosService } from 'src/app/Servicios/Detalle_BodegaRollos/Detalle_BodegaRollos.service';
import { EstadosService } from 'src/app/Servicios/Estados/estados.service';
import { EstadosProcesos_OTService } from 'src/app/Servicios/EstadosProcesosOT/EstadosProcesos_OT.service';
import { FallasTecnicasService } from 'src/app/Servicios/FallasTecnicas/FallasTecnicas.service';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { UsuarioService } from 'src/app/Servicios/Usuarios/usuario.service';
import { modelClienteReporteOT } from 'src/app/Modelo/modelClienteReporteOT';
import { AppComponent } from 'src/app/app.component';
import { ShepherdService } from 'angular-shepherd';
import { Reporte_Procesos_OTComponent } from './Reporte_Procesos_OT.component';

describe('Reporte_Procesos_OTComponent', () => {
  let component: Reporte_Procesos_OTComponent;
  let clientesService: jasmine.SpyObj<ClientesService>;

  beforeEach(() => {
    clientesService = jasmine.createSpyObj<ClientesService>('ClientesService', ['srvObtenerResumenReporteOT']);
    TestBed.configureTestingModule({
      providers: [
        { provide: FormBuilder, useValue: new FormBuilder() },
        { provide: AppComponent, useValue: { temaSeleccionado: false } },
        { provide: FallasTecnicasService, useValue: {} },
        { provide: EstadosProcesos_OTService, useValue: {} },
        { provide: Detalle_BodegaRollosService, useValue: {} },
        { provide: EstadosService, useValue: {} },
        { provide: BagproService, useValue: {} },
        { provide: UsuarioService, useValue: {} },
        { provide: ClientesService, useValue: clientesService },
        { provide: ShepherdService, useValue: {} },
        { provide: MensajesAplicacionService, useValue: {} }
      ]
    });
    component = new Reporte_Procesos_OTComponent(
      TestBed.inject(FormBuilder),
      TestBed.inject(AppComponent),
      TestBed.inject(FallasTecnicasService),
      TestBed.inject(EstadosProcesos_OTService),
      TestBed.inject(Detalle_BodegaRollosService),
      TestBed.inject(EstadosService),
      TestBed.inject(BagproService),
      TestBed.inject(UsuarioService),
      TestBed.inject(ClientesService),
      TestBed.inject(ShepherdService),
      TestBed.inject(MensajesAplicacionService)
    );
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads the OT report from the customer summary service', () => {
    const customers: modelClienteReporteOT[] = [
      { cli_Id: 15, cli_Nombre: 'Cliente de prueba', usua_Id: 8 }
    ];
    clientesService.srvObtenerResumenReporteOT.and.returnValue(of(customers));

    component.obtenerClientes();

    expect(clientesService.srvObtenerResumenReporteOT).toHaveBeenCalled();
    expect(component.clientes).toEqual(customers);
  });

  it('replaces the selected customer ID with its name when a customer matches', () => {
    component.clientes = [
      { cli_Id: 15, cli_Nombre: 'Cliente de prueba', usua_Id: 8 }
    ];
    component.formularioOT.patchValue({ cliente: '15' });

    component.selectEventCliente();

    expect(component.formularioOT.value.cliente).toBe('Cliente de prueba');
  });

  it('keeps the entered value when the customer list is empty', () => {
    component.clientes = [];
    component.formularioOT.patchValue({ cliente: '15' });

    component.selectEventCliente();

    expect(component.formularioOT.value.cliente).toBe('15');
  });

  it('keeps the entered value when no customer matches', () => {
    component.clientes = [
      { cli_Id: 20, cli_Nombre: 'Otro cliente', usua_Id: 8 }
    ];
    component.formularioOT.patchValue({ cliente: '15' });

    component.selectEventCliente();

    expect(component.formularioOT.value.cliente).toBe('15');
  });
});
