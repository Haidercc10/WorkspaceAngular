import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { PruebaArchivosService } from 'src/app/Servicios/pruebaArchivos.service';
import { SrvInsumosService } from 'src/app/Servicios/srv-insumos.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-prueba-imagen-cat-insumo',
  templateUrl: './prueba-imagen-cat-insumo.component.html',
  styleUrls: ['./prueba-imagen-cat-insumo.component.css']
})
export class PruebaImagenCatInsumoComponent implements OnInit {

  public formularioCatInsumo !: FormGroup;
  public titulosTabla = [];
  public Url : any;
  public ArrayCatgInsumos = [];
  public NombreImagen : any;
  arcvhivo : any;
  selectedFile: File = null;

  constructor(private srvInsumos : SrvInsumosService,
    private frmBuilder : FormBuilder,
    private pruebaArchivos : PruebaArchivosService) {

      this.formularioCatInsumo = this.frmBuilder.group({
        catImagen : new FormControl(),
      });
  }

  ngOnInit(): void {
    this.ColumnasTabla();
  }

  initForms(){
    this.formularioCatInsumo = this.frmBuilder.group({
      catImagen : null,
    });
  }

  clear(){
     this.formularioCatInsumo.reset();
  }

  ColumnasTabla(){
    this.titulosTabla = [{
      cNombre : "Nombre",
      cDescripcion : "Descripción",
      cImagen : "Imagen",
    }];
  }

  onSelectFile(fileInput: any) {
    this.selectedFile = <File>fileInput.target.files[0];
  }


  cargarArchivos(){
    const formData = new FormData();
    formData.append('archivo', this.selectedFile);
    console.log(formData)
    this.pruebaArchivos.srvGuardar(formData).subscribe(datos_archivo => {
      console.log(formData)
    })
  }























    //Llamar modal después de haber cargado la imagen.
    cargarImagen(event) {
      this.ArrayCatgInsumos = [];
      console.log(event.target.files)
      let nombreArchivo : string = this.formularioCatInsumo.get('catImagen')?.value;
      //const file = event.target.files[0];
          if(event.target.files[0]) {
            this.arcvhivo = event.target.files[0];
            let reader = new FileReader(); //Instancia de fileReader
            reader.readAsDataURL(event.target.files[0]);
            reader.onload = (event) =>
            this.Url = event.target.result;
            this.NombreImagen = event.target.files[0].name;
            this.ArrayCatgInsumos.push(event.target.files);
            //console.log(event.target.files[0]);
            // console.log(event.target.files[0]);
            // console.log(this.NombreImagen);
            // console.log(event.target.files[0])
            const formData = new FormData();
            formData.append('file', this.arcvhivo);
            this.pruebaArchivos.srvGuardar(formData).subscribe(datos_archisvo => {
              console.log(this.ArrayCatgInsumos)
            })

          }
    }


    enviarArchivo(){
      console.log(this.ArrayCatgInsumos)
      let formData : FormData;
      this.pruebaArchivos.srvGuardar(formData).subscribe(datos_archisvo => {
        console.log(this.ArrayCatgInsumos)
      })
    }

    cargarDatosEnTabla(){
      //console.log(this.NombreImagen)
      let datosAtabla : any = {
        catgNombre : this.formularioCatInsumo.get('catNombre')?.value,
        catgDescripcion : this.formularioCatInsumo.get('catDescripcion')?.value,
        catgImagen : this.NombreImagen,
      }
      //let rutaFakeImagen = datosAtabla.catgImagen
      //let NombreImagen = rutaFakeImagen.substring(12);
      //datosAtabla.catgImagen = NombreImagen;


      //console.log(datosAtabla);
    }

    registrarCategoriaInsumo() {
      console.log(this.ArrayCatgInsumos);
      this.srvInsumos.srvAgregar(this.ArrayCatgInsumos).subscribe(datosCatInsumo => {
          const Toast = Swal.mixin({
            toast: true,
            position: 'center',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.addEventListener('mouseenter', Swal.stopTimer)
              toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
          });
          Toast.fire({
            icon: 'success',
            title: 'Categoria creada con éxito.'
          });
      });
    }

}
