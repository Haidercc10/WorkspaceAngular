import Step from 'shepherd.js/src/types/step';
import { TutorialesService } from 'src/app/Servicios/Tutoriales/Tutoriales.service';
import { armar, paso } from 'src/app/Tutoriales/Tutoriales_Comun';

/*
 * Tutorial de Gestión de Usuarios (registro-component): pestañas Usuarios, Roles y Áreas.
 * Los elementos se marcan con `data-tutorial` en la plantilla.
 */

export const ClaveTutorialUsuarios = 'registro-usuarios-v1';

export interface ContextoTutorialUsuarios {
  /** Cambia a la pestaña indicada (0 = Usuarios, 1 = Roles, 2 = Áreas). */
  irPestana : (indice : number) => void;
}

const el = (nombre : string) => `[data-tutorial="${nombre}"]`;

export function pasosTutorialUsuarios(ctx : ContextoTutorialUsuarios) : Step.StepOptions[] {
  /** Antes de mostrar el paso cambia a la pestaña y espera a que el elemento sea visible. */
  const en = (pestana : number, nombre : string) => ({ beforeShowPromise: TutorialesService.prepararPantalla(() => ctx.irPestana(pestana), el(nombre)) });

  return armar('tutorial-usuarios', [
    paso(null, '¡Gestión de Usuarios!',
      `<p>¡En esta página se administran los <b>usuarios</b> del sistema, sus <b>roles</b> (qué vistas pueden ver) y las <b>áreas</b> de la empresa!</p>`),

    paso(el('pestanas'), '¡Pestañas!',
      `<p>Cada pestaña tiene su propio botón para crear y su propia tabla:</p>
       <ul>
         <li><b>Usuarios:</b> crear, editar, inactivar y exportar a Excel.</li>
         <li><b>Roles:</b> crear y editar roles con sus vistas permitidas.</li>
         <li><b>Áreas:</b> crear y editar las áreas de la empresa.</li>
       </ul>`, en(0, 'pestanas')),

    paso(el('nuevoUsuario'), '¡Nuevo Usuario!',
      `<p>Abre el formulario para crear un usuario. Todos los campos son obligatorios excepto la cédula.</p>
       <p>Empieza por la <b>cédula</b>: el <b>ID de usuario</b> se llena solo con sus últimos 4 dígitos. Puedes cambiar o borrar ese ID (por ejemplo, para usuarios genéricos u operarios), y si ya pertenece a otro usuario se te avisará.</p>
       <p>El nombre se escribe siempre en <b>mayúsculas</b>.</p>`, en(0, 'nuevoUsuario')),

    paso(el('inactivarUsuarios'), '¡Inactivar Seleccionados!',
      `<p>Marca uno o varios usuarios en la tabla y usa este botón para <b>inactivarlos</b>. Se pide confirmación antes de hacerlo.</p>
       <p>Los usuarios inactivos no se borran: puedes volver a activarlos editándolos.</p>`, en(0, 'inactivarUsuarios')),

    paso(el('totalUsuarios'), '¡Total de Usuarios!',
      `<p>Cantidad de usuarios registrados en el sistema (aunque la tabla esté filtrada).</p>
       <p>Pon el cursor encima para ver cuántos están <b>activos</b> y cuántos <b>inactivos</b>.</p>`, en(0, 'totalUsuarios')),

    paso(el('exportarUsuarios'), '¡Exportar a Excel!',
      `<p>Descarga en Excel los usuarios que se ven en la tabla. Si aplicaste un filtro, solo se exportan los usuarios filtrados.</p>`, en(0, 'exportarUsuarios')),

    paso(el('buscarUsuarios'), '¡Buscar!',
      `<p>Filtra la tabla por ID, cédula, nombre, área o rol.</p>`, en(0, 'buscarUsuarios')),

    paso(el('tablaUsuarios'), '¡Tabla de Usuarios!',
      `<p>Con el botón <i class="pi pi-pencil"></i> editas los datos del usuario (incluida la contraseña) y con <i class="pi pi-ban"></i> lo inactivas.</p>`,
      { ...en(0, 'tablaUsuarios'), attachTo: { element: el('tablaUsuarios'), on: 'top' } }),

    paso(el('nuevoRol'), '¡Nuevo Rol!',
      `<p>Crea un rol indicando su nombre, descripción y las vistas de la aplicación a las que tendrá acceso.</p>
       <p>Al crear un rol también se crea un <b>tipo de usuario</b> con el mismo nombre.</p>`, en(1, 'nuevoRol')),

    paso(el('totalRoles'), '¡Total de Roles!',
      `<p>Cantidad de roles creados en el sistema.</p>`, en(1, 'totalRoles')),

    paso(el('tablaRoles'), '¡Tabla de Roles!',
      `<p>Con el botón <i class="pi pi-pencil"></i> cambias el nombre, la descripción o las vistas permitidas del rol.</p>`,
      { ...en(1, 'tablaRoles'), attachTo: { element: el('tablaRoles'), on: 'top' } }),

    paso(el('nuevaArea'), '¡Nueva Área!',
      `<p>Crea un área de la empresa para asignarla a los usuarios.</p>`, en(2, 'nuevaArea')),

    paso(el('totalAreas'), '¡Total de Áreas!',
      `<p>Cantidad de áreas creadas en el sistema.</p>`, en(2, 'totalAreas')),

    paso(el('tablaAreas'), '¡Tabla de Áreas!',
      `<p>Con el botón <i class="pi pi-pencil"></i> cambias el nombre o la descripción del área.</p>`,
      { ...en(2, 'tablaAreas'), attachTo: { element: el('tablaAreas'), on: 'top' } }),
  ]);
}
