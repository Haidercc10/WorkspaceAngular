import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';

@Injectable({
  providedIn: 'root'
})
export class EncriptacionService {

  secretKey = "ZN+Lvg_)=inW@e&@/?et{XyW?3QbF{(NKn+2+nPgq[;hk8wLpLZppg*ZkRP5wGL?X{Dm9NC*QVVVe.Z[p.Qbd{c={fhGYqCX4WXvmJiGE38NWC?NSAri[8C2";
  constructor() { }

  encrypt = (value : string) : string => CryptoJS.AES.encrypt(value, this.secretKey.trim()).toString();

  decrypt = (textToDecrypt : string) => CryptoJS.AES.decrypt(textToDecrypt, this.secretKey.trim()).toString(CryptoJS.enc.Utf8);
}
