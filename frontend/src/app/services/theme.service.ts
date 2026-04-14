import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private _isDarkModeAutomatic = false;
  private intervalId: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      const savedPreference = localStorage.getItem('darkModeAutomatic');
      if (savedPreference !== null) {
        this._isDarkModeAutomatic = savedPreference === 'true';
      }

      if (this._isDarkModeAutomatic) {
        this.checkAndApplyAutomaticTheme();
        this.startCheckingTheme();
      }
    }
  }

  get isDarkModeAutomatic(): boolean {
    return this._isDarkModeAutomatic;
  }

  setDarkModeAutomatic(isAutomatic: boolean) {
    this._isDarkModeAutomatic = isAutomatic;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('darkModeAutomatic', isAutomatic.toString());
      if (isAutomatic) {
        this.checkAndApplyAutomaticTheme();
        this.startCheckingTheme();
      } else {
        this.stopCheckingTheme();
        this.disableDarkMode();
      }
    }
  }

  private checkAndApplyAutomaticTheme() {
    if (!isPlatformBrowser(this.platformId)) return;

    const currentHour = new Date().getHours();
    if (currentHour >= 20 || currentHour < 8) {
      this.enableDarkMode();
    } else {
      this.disableDarkMode();
    }
  }

  private startCheckingTheme() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stopCheckingTheme();
    this.intervalId = setInterval(() => {
      this.checkAndApplyAutomaticTheme();
    }, 60000);
  }

  private stopCheckingTheme() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private enableDarkMode() {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-theme');
    }
  }

  private disableDarkMode() {
    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-theme');
    }
  }
}
