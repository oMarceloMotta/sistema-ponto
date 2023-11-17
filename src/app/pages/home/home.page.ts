import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { AuthData } from 'src/app/models/login.model';
import { PaginatedData, TimeSheetData } from 'src/app/models/timesheet.model';
import { Backend } from 'src/app/services/backend';
import { Toast } from 'src/app/services/toast';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  dateNow = new Date();
  user: AuthData = {} as AuthData;
  timeWorkNow: string = '';
  firstName: string = '';
  myListTimeSheet: PaginatedData<TimeSheetData> = {} as PaginatedData<TimeSheetData>;
  myTimeSheetNow: TimeSheetData = {} as TimeSheetData;
  constructor(
    private backend: Backend,
    private router: Router,
    private toast: Toast,
    private loadingCtrl: LoadingController,
  ) { }
  async ngOnInit() {
    const loading = await this.loadingCtrl.create({
      message: 'Carregando...',
      cssClass: 'custom-loading'
    });
    loading.present();
    this.updateDateNow();
    if (localStorage.getItem('login')) {
      const userStorage: string | null = localStorage?.getItem('login');
      this.user = userStorage ? JSON.parse(userStorage) : '';
      this.firstName = this.user.name.split(' ')[0];
      this.getTimeSheet();
      loading.dismiss();
    }


  }

  getTimeSheet() {
    this.backend.get('/Timesheet').subscribe({
      next: value => {
        this.myListTimeSheet = value;
        this.myTimeSheetNow =
          this.myListTimeSheet.items[0];
        this.myListTimeSheet.items.map(item => {
          const time = this.workTime(Number(new Date(item.start).getTime()),
            Number(new Date(item.startLunch).getTime()),
            Number(new Date(item.endLunch).getTime()),
            new Date(item.end).getTime());
          return item.time = time;
        })
      },
      error: error => {
        this.toast.presentToast('Erro ao carregar os pontos', 2000, 'warning');
        console.log(error);
      }
    });
  }
  async postTimeSheet(tipo: string) {
    const isValid = this.isValidUpdateAction(tipo);
    if (isValid) {
      const loading = await this.loadingCtrl.create({
        message: 'Salvando...',
        cssClass: 'custom-loading'
      });
      loading.present();

      this.backend.post('/Timesheet', {}).subscribe({
        next: value => {
          this.getTimeSheet();
          loading.dismiss();
          this.toast.presentToast('Salvo com sucesso');
        },
        error: error => {
          loading.dismiss();
          this.toast.presentToast('Salvo sem sucesso, tente novamente mais tarde', 1000, 'warning');
        },
      });
    } else {
      this.toast.presentToast('Ação Inválida', 1000, 'warning');
    }
  }
  isValidUpdateAction(actionType: string) {
    switch (actionType) {
      case 'CHEGUEI':
        return (this.myTimeSheetNow.start
          && this.myTimeSheetNow.startLunch
          && this.myTimeSheetNow.endLunch
          && this.myTimeSheetNow.end);
      case 'FUI ALMOCAR':
        return this.myTimeSheetNow.start
          && !this.myTimeSheetNow.startLunch
          && !this.myTimeSheetNow.endLunch;
      case 'VOLTEI':
        return !!this.myTimeSheetNow.startLunch
          && this.myTimeSheetNow.start
          && !this.myTimeSheetNow.endLunch;
      case 'FUI':
        return this.myTimeSheetNow.start
          && this.myTimeSheetNow.startLunch
          && this.myTimeSheetNow.endLunch
          && !this.myTimeSheetNow.end
      default:
        return false; // Tipo desconhecido, impedir a ação
    }
  }

  async updateTimeSheet(tipo: string) {
    const isValid = this.isValidUpdateAction(tipo);
    if (isValid) {
      const loading = await this.loadingCtrl.create({
        message: 'Salvando...',
        cssClass: 'custom-loading'
      });
      loading.present();
      if (!this.myTimeSheetNow.startLunch) {
        this.myTimeSheetNow.startLunch = new Date();
      } else if (!this.myTimeSheetNow.endLunch) {
        this.myTimeSheetNow.endLunch = new Date();
      } else if (!this.myTimeSheetNow.end) {
        this.myTimeSheetNow.end = new Date();
      }
      this.backend.put(`/Timesheet/${this.myTimeSheetNow.id}`, this.myTimeSheetNow).subscribe({
        next: value => {
          this.getTimeSheet();
          this.toast.presentToast('Salvo com sucesso');
        },
        error: error => {
          this.toast.presentToast('Salvo sem sucesso, tente novamente mais tarde', 1000, 'warning');
        }
      });
      loading.dismiss();
    } else {
      this.toast.presentToast('Ação Inválida', 1000, 'warning');
    }
  }
  workTime(start: number, startLunch: number, endLunch: number, end: number) {
    let totalWorkingDuration = 0;
    let lunchBreakDuration = 0
    totalWorkingDuration = this.dateNow.getTime() - start;
    if (startLunch && endLunch) {
      lunchBreakDuration = endLunch - startLunch;
      totalWorkingDuration = this.dateNow.getTime() - start - lunchBreakDuration;
    }
    if (startLunch && endLunch && end) {
      lunchBreakDuration = endLunch - startLunch;
      totalWorkingDuration = end - start - lunchBreakDuration;
    }
    const totalHours = Math.floor(totalWorkingDuration / (60 * 60 * 1000));
    const totalMinutes = Math.floor((totalWorkingDuration % (60 * 60 * 1000)) / (60 * 1000));
    const totalSeconds = Math.floor((totalWorkingDuration % (60 * 1000)) / 1000);
    return totalHours + ':' + totalMinutes + ':' + totalSeconds;
  }
  updateDateNow() {
    setInterval(() => {
      this.dateNow = new Date();
      this.timeWorkNow = this.workTime(Number(new Date(this.myTimeSheetNow.start).getTime()),
        Number(new Date(this.myTimeSheetNow.startLunch).getTime()),
        Number(new Date(this.myTimeSheetNow.endLunch).getTime()),
        new Date(this.myTimeSheetNow.end).getTime());
    }, 1000);
  }
  logout() {
    localStorage.removeItem('login');
    this.router.navigateByUrl('login');
  }
}
