import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthData } from '../models/login.model';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const authLogin = localStorage.getItem('login');
    if (authLogin !== null) {
      const auth = JSON.parse(authLogin);
      if (this.isTokenExpired(auth)) {
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    } else {
      this.router.navigate(['/login']);
      return false;
    }
  }
  isTokenExpired(auth: AuthData) {
    return auth.expiresIn - (new Date().getTime()) < 0
  }
}
