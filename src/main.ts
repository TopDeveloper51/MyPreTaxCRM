import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from '@app/app.module';
import { environment } from '@environments/environment';


import { LicenseManager } from 'ag-grid-enterprise';

// tslint:disable-next-line: max-line-length
LicenseManager.setLicenseKey('Dynamic_1001_GmbH_MyTaxPrepOffice_single_1_Devs_1_Deployment_License_23_December_2020_[v2]_MTYwODY4MTYwMDAwMA==2623ade9514badc40e11c43c70901aa6');


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule).then(() => {
  if (navigator.serviceWorker && environment.production) {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ngsw-worker.js');
    }
  }
})
  .catch(err => console.log(err));

