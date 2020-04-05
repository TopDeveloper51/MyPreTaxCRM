// External Imports
import { Injectable } from '@angular/core';

// Internal Imports
import { UserService } from '@app/shared/services/user.service';
import { CommonApiService } from '@app/shared/services/common-api.service';
import { LocalStorageUtilityService } from '@app/shared/services/local-storage-utility.service';
import { DataStoreService } from '@app/shared/services/data-store.service';
import { AuthenticationService } from '@app/authentication/authentication.service';

@Injectable({
    providedIn: null
})
export class LogoutService {

    constructor(
        private userService: UserService,
        private commonAPI: CommonApiService,
        private localStorageUtilityService: LocalStorageUtilityService,
        private dataStoreService: DataStoreService,
        private authService: AuthenticationService) { }

    /**
       * Logout the User from the application
       */
    public doLogout(): any {
        return new Promise((resolve, reject) => {
            this.commonAPI
                .getPromiseResponse({ apiName: '/auth/logout', methodType: 'post' })
                .then(
                    (res: any) => {
                        this.unSetUserData();
                        this.authService.createSession(true).then(
                            () => {
                                resolve(true);
                            },
                            error => {
                                reject(error);
                            }
                        );
                    },
                    error => {
                        this.unSetUserData();
                        this.authService.createSession(true).then(
                            () => {
                                resolve(true);
                            },
                            error => {
                                reject(error);
                            }
                        );
                    }
                );
        });
    }
    /**
      * Purpose is to reset the user and app related data to the user service at common level
      */
    private unSetUserData() {
        this.userService.userDetail = {};
        this.dataStoreService.resetStoreData();
        this.localStorageUtilityService.clearLocalStorage();
    }

}
