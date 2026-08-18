import { ApplicationConfig, LOCALE_ID, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { providePrimeNG } from 'primeng/config';

import { routes } from './app.routes';
import PresetClinicaRestauracao from './primeng-preset';
import { MessageService } from 'primeng/api';

import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
      theme: {
        preset: PresetClinicaRestauracao,
        options: {
          darkModeSelector: '.my-app-dark',
        },
      },
    }),
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
