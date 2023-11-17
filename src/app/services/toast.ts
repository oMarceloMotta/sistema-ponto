import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class Toast {
  constructor(private toastController: ToastController) { }

  async presentToast(message: string,
    duration: number = 2000,
    color = 'success') {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      position: 'bottom',
      color: color,
    });
    toast.present();
  }
}
