import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FullCalendarModule } from '@fullcalendar/angular';
import { AutocompleteLibModule } from 'angular-ng-autocomplete';
import { NgChartsModule } from 'ng2-charts';
import { CookieService } from 'ngx-cookie-service';
import { NgxPaginationModule } from 'ngx-pagination';
import { StorageServiceModule } from 'ngx-webstorage-service';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { CascadeSelectModule } from "primeng/cascadeselect";
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ColorPickerModule } from 'primeng/colorpicker';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { ContextMenuModule } from 'primeng/contextmenu';
import { DataViewModule } from 'primeng/dataview';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DockModule } from 'primeng/dock';
import { DropdownModule } from 'primeng/dropdown';
import { FieldsetModule } from 'primeng/fieldset';
import { FileUploadModule } from 'primeng/fileupload';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { KnobModule } from 'primeng/knob';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { PanelMenuModule } from 'primeng/panelmenu';
import { PasswordModule } from 'primeng/password';
import { PickListModule } from 'primeng/picklist';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { SlideMenuModule } from 'primeng/slidemenu';
import { SliderModule } from 'primeng/slider';
import { SpeedDialModule } from 'primeng/speeddial';
import { TableModule } from 'primeng/table';
import { TabMenuModule } from 'primeng/tabmenu';
import { TabViewModule } from 'primeng/tabview';
import { TagModule } from 'primeng/tag';
import { TieredMenuModule } from 'primeng/tieredmenu';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TreeSelectModule } from 'primeng/treeselect';
import { TreeTableModule } from 'primeng/treetable';
import { VirtualScrollerModule } from 'primeng/virtualscroller';
import { MaterialExampleModule } from '../material.module';
import { ArchivosComponent } from './Vistas/Archivos/Archivos.component';
import { CalendarioComponent } from './Vistas/Calendario/Calendario.component';
import { Inventario_Bodegas_RollosComponent } from './Vistas/Inventario_Bodegas_Rollos/Inventario_Bodegas_Rollos.component';
import { Movimientos_DespachoComponent } from './Vistas/Movimientos_Despacho/Movimientos_Despacho.component';
import { PaginaPrincipalComponent } from './Vistas/PaginaPrincipal/PaginaPrincipal.component';
import { Produccion_ExtrusionComponent } from './Vistas/Produccion_Extrusion/Produccion_Extrusion.component';
import { Produccion_SelladoComponent } from './Vistas/Produccion_Sellado/Produccion_Sellado.component';
import { ReporteDespachoComponent } from './Vistas/Reporte-Despacho/Reporte-Despacho.component';
import { ReporteProduccionComponent } from './Vistas/Reporte-Produccion/Reporte-Produccion.component';
import { Reporte_DesperdiciosComponent } from './Vistas/Reporte_Desperdicios/Reporte_Desperdicios.component';
import { TicketsComponent } from './Vistas/Tickets/Tickets.component';
import { VistasFavoritasComponent } from './Vistas/VistasFavoritas/VistasFavoritas.component';
import { DesperdicioComponent } from './Vistas/desperdicio/desperdicio.component';
import { LoginComponentComponent } from './Vistas/login-component/login-component.component';
import { MenuLateralComponent } from './Vistas/menuLateral/menuLateral.component';
import { ErrorInterceptor } from './_helpers/error.interceptor';
import { errorInterceptor_BagPro } from './_helpers/error.interceptor_BagPro';
import { ErrorInterceptor_ContaZeus } from './_helpers/error.interceptor_ContaZeus';
import { ErrorInterceptor_InvZeus } from './_helpers/error.interceptor_InvZeus';
import { JwtInterceptor } from './_helpers/jwt.interceptor';
import { jwtInterceptor_BagPro } from './_helpers/jwt.interceptor_BagPro';
import { JwtInterceptor_ContaZeus } from './_helpers/jwt.interceptor_ContaZeus';
import { JwtInterceptor_InvZeus } from './_helpers/jwt.interceptor_InvZeus';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponentComponent,
    PaginaPrincipalComponent,
    DesperdicioComponent,
    MenuLateralComponent,
    ArchivosComponent,
    ReporteDespachoComponent,
    Reporte_DesperdiciosComponent,
    TicketsComponent,
    VistasFavoritasComponent,
    CalendarioComponent,
    Inventario_Bodegas_RollosComponent,
    ReporteProduccionComponent,
    Produccion_SelladoComponent,
    Produccion_ExtrusionComponent,
    Movimientos_DespachoComponent,
  ],

  imports: [
    BrowserModule,
    ReactiveFormsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    NgxPaginationModule,
    StorageServiceModule,
    BrowserAnimationsModule,
    MatNativeDateModule,
    MaterialExampleModule,
    AutocompleteLibModule,
    TableModule,
    CalendarModule,
		SliderModule,
		DialogModule,
		MultiSelectModule,
		ContextMenuModule,
		DropdownModule,
		ButtonModule,
		ToastModule,
    InputTextModule,
    ProgressBarModule,
    AutoCompleteModule,
    DockModule,
    BrowserModule,
    BrowserAnimationsModule,
    TableModule,
    CalendarModule,
		SliderModule,
		DialogModule,
		MultiSelectModule,
		ContextMenuModule,
		DropdownModule,
		ButtonModule,
		ToastModule,
    InputTextModule,
    ProgressBarModule,
    HttpClientModule,
    FileUploadModule,
    ToolbarModule,
    RatingModule,
    FormsModule,
    RadioButtonModule,
    InputNumberModule,
    ConfirmDialogModule,
    InputTextareaModule,
    AccordionModule,
    SlideMenuModule,
    CascadeSelectModule,
    MenuModule,
    PickListModule,
    CarouselModule,
    CardModule,
    ConfirmPopupModule,
    TabViewModule,
    ScrollPanelModule,
    NgChartsModule,
    ChartModule,
    SkeletonModule,
    InputSwitchModule,
    TreeTableModule,
    CheckboxModule,
    SidebarModule,
    TabMenuModule,
    PasswordModule,
    ProgressSpinnerModule,
    FieldsetModule,
    DividerModule,
    ChipModule,
    TagModule,
    VirtualScrollerModule,
    KnobModule,
    DataViewModule,
    RippleModule,
    ImageModule,
    GalleriaModule,
    OverlayPanelModule,
    SpeedDialModule,
    FullCalendarModule,
    TreeSelectModule,
    AvatarModule,
    BadgeModule,
    PanelMenuModule,
    FieldsetModule,
    AccordionModule,
    ToggleButtonModule,
    TieredMenuModule,
    ListboxModule,
    ColorPickerModule,
  ],

  providers: [
    CookieService,
    MessageService,
    ConfirmationService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor_InvZeus, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor_InvZeus, multi: true },

    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor_ContaZeus, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor_ContaZeus, multi: true },

    { provide: HTTP_INTERCEPTORS, useClass: jwtInterceptor_BagPro, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: errorInterceptor_BagPro, multi: true },
  ],

  bootstrap: [AppComponent]
})
export class AppModule { }
