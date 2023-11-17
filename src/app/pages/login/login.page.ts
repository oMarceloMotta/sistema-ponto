import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { Backend } from 'src/app/services/backend';
import { Toast } from 'src/app/services/toast';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  loginForm = new FormGroup({
    userID: new FormControl('', [Validators.required, Validators.email]),
    accessKey: new FormControl('', [Validators.required]),
  });
  constructor(private loadingCtrl: LoadingController,
    private backend: Backend,
    private router: Router,
    private toast: Toast,) { }

  async login() {
    const loading = await this.loadingCtrl.create({
      message: 'Verificando...',
      cssClass: 'custom-loading'
    });
    try {
      loading.present();
      if (this.dadosLoginValido() === false) {
        loading.dismiss();
        this.toast.presentToast('Por favor, verifique as informações e tente novamente.',
          2000,
          'warning');
        return;
      }
      const account = {
        ...this.loginForm.value, grantType: 'password',
      }

      this.backend.post('/Accounts', account).subscribe({
        next: value => {
          localStorage.setItem('login', JSON.stringify(value));
          this.router.navigateByUrl('home');
          loading.dismiss();
        },
        error: error => {
          console.error(error);
          loading.dismiss();
          this.toast.presentToast('Conta inválida, por favor, verifique as informações e tente novamente.', 2000, 'warning');
        }
      });
    } catch (error) {
      loading.dismiss();
      console.log(error)
    }
  }
  dadosLoginValido() {
    const userIDControl = this.loginForm.get('userID');
    const accessKeyControl = this.loginForm.get('accessKey');

    return (userIDControl?.hasError('required') || userIDControl?.hasError('email') || accessKeyControl?.hasError('required') ||
      userIDControl?.touched || accessKeyControl?.touched);
  }


}
