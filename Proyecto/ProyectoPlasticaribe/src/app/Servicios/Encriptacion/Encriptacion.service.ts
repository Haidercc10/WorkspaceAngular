import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncriptacionService {

  secretKey = "YourSecretKeyForEncryption&Descryption";
  constructor() { }

  encrypt = (value : string) : string => CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();

  decrypt = (textToDecrypt : string) => CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(CryptoJS.enc.Utf8);
}
