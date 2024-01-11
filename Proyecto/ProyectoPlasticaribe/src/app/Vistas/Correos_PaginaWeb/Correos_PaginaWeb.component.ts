import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { collection, getDocs, doc, setDoc } from "firebase/firestore"; 
import moment from 'moment';
import { MensajesAplicacionService } from 'src/app/Servicios/MensajesAplicacion/MensajesAplicacion.service';
import { Web_ContactoCorreoService } from 'src/app/Servicios/Web_ContactoCorreo/Web_ContactoCorreo.service';
import { db } from 'src/app/conexionFirebase';

@Component({
  selector: 'app-Correos_PaginaWeb',
  templateUrl: './Correos_PaginaWeb.component.html',
  styleUrls: ['./Correos_PaginaWeb.component.css']
})
export class Correos_PaginaWebComponent implements OnInit {

  mails: any[] = [];
  modalMailInformation : boolean = false;
  formMailInformation: FormGroup;
  loading : boolean = false;

  constructor(private frmBuilder : FormBuilder,
    private msg : MensajesAplicacionService,
    private sendMailsService : Web_ContactoCorreoService,) {
    this.formMailInformation = this.frmBuilder.group({
      id : [''],
      mail : [''],
      phoneNumber: [''],
      name : [''],
      subject : [''],
      message : [''],
      date : [''],
      hour : [''],
      response: [null, Validators.required],
      status: [''],
    });
  }

  ngOnInit() {
    this.getMails();
  }

  async getMails(){
    const querySnapshot = await getDocs(collection(db, "Correos"));
    querySnapshot.forEach((doc) => {
      this.mails.push({
        Id : doc.id,
        Correo : doc.data()['Correo'],
        Telefono : doc.data()['Telefono'],
        Nombre : doc.data()['Nombre'],
        Asunto : doc.data()['Asunto'],
        Mensaje : doc.data()['Mensaje'],
        Fecha : doc.data()['Fecha'],
        Hora : (doc.data()['Hora']).length == 7 ? `0${doc.data()['Hora']}` : doc.data()['Hora'],
        Respuesta : doc.data()['Respuesta'],
        Estado : doc.data()['Estado'],
      });
      this.mails.sort((a, b) => a.Hora.localeCompare(b.Hora));
      this.mails.sort((a, b) => b.Fecha.localeCompare(a.Fecha));
    });
  }

  getinfoNewMails(){
    this.mails = this.mails.filter((mail) => !mail.Estado);
  }

  getInforResponsedMails(){
    this.mails = this.mails.filter((mail) => mail.Respuesta);
  }

  getNewMails() : number {
    let newMails = 0;
    this.mails.forEach((mail) => {
      if (!mail.Estado) newMails += 1;
    });
    return newMails;
  }

  getResponseMails() : number {
    let responseMails = 0;
    this.mails.forEach((mail) => {
      if (mail.Respuesta) responseMails += 1;
    });
    return responseMails;
  }

  getBreakeRows(message : string) : number {
    let numRows : number = 0;
    let rows = message.split('\n');
    numRows = rows.length + 1;
    return numRows;
  }

  showMailInformation(mail : any){
    this.formMailInformation.setValue({
      id: mail.Id,
      mail : mail.Correo,
      phoneNumber: mail.Telefono,
      name : mail.Nombre,
      subject : mail.Asunto,
      message : mail.Mensaje,
      date : mail.Fecha,
      hour : mail.Hora,
      response: mail.Respuesta || '',
      status: mail.Estado || '',
    });
    this.modalMailInformation = true;
    this.markAsMailRead();
  }

  markAsMailRead(){
    let id : string = this.formMailInformation.value.id;
    const mail = doc(db, 'Correos', id);
    setDoc(mail, { Estado: 'Leido' }, { merge: true });
  }

  sendResponse(){
    this.loading = true;
    let id : string = this.formMailInformation.value.id;
    let response = this.formMailInformation.value.response
    const mail = doc(db, 'Correos', id);
    setDoc(mail, { Respuesta: response }, { merge: true });
    this.sendMailResponse();
  }

  sendMailResponse(){
    let data : any = {
      Nombre: this.formMailInformation.value.name,
      Telefono: this.formMailInformation.value.phoneNumber,
      Correo: this.formMailInformation.value.mail,
      Asunto: this.formMailInformation.value.subject,
      Mensaje: this.formMailInformation.value.message,
      Fecha_Envio: moment().format('YYYY-MM-DD'),
      Hora_Envio: moment().format('HH:mm:ss'),
    };
    this.sendMailsService.SendMail(data).subscribe(() => {
      this.msg.mensajeConfirmacion('Respuesta enviada');
      this.loading = false;
    });
  }

}
