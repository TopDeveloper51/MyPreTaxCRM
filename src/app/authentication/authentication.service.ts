// External Imports
import { Injectable, Inject, PLATFORM_ID, Injector } from '@angular/core';
import { Router } from '@angular/router';

// Internal Imports
import { UserService } from '@app/shared/services/user.service';
import { CommonApiService } from '@app/shared/services/common-api.service';
import { CRMSocketService } from '@app/shared/services/crmsocket.service';
import { ChatSocketService } from '@app/chat/socket/chat-socket.service';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    public lastUserPath = '';
    private isAuthenticated: boolean = false;
    //flag that indicate is session established or not
    public isSessionEstablished: boolean = false;

    constructor(
        private userService: UserService,
        private commonAPI: CommonApiService,
        private crmSocketService: CRMSocketService,
        private chatSocketService: ChatSocketService,
        private injector: Injector,
        @Inject(PLATFORM_ID) protected platformId: object

    ) { }

    /**
     * Purpose is to save the user and app related data to the user service at common level
     * @param userDetails User Data
     * @param redirectToLastUserPath Flag whether to redirect to last userVisitedPath
     */
    public setUserData(
        userDetails: any,
        redirectToLastUserPath: boolean
    ) {
        if (redirectToLastUserPath) {
            this.userService.userDetail = userDetails;
            this.crmSocketService.register(userDetails);
            this.chatSocketService.register_chat(userDetails);
        }
    }

    /**
     * Call the Session API on APP_INITIALIZER
     * @param redirectToLastUserPath Flag whether to redirect to last userVisitedPath
     */
    public createSession(redirectToLastUserPath: any): any {
        return new Promise((resolve, reject) => {
            this.commonAPI
                .getPromiseResponse({
                    apiName: `/auth/session`,
                    methodType: 'get',
                    showLoading: false,
                    isOffline: true
                })
                .then(
                    (res: any) => {
                        const userDetails = res ? res : {};
                        this.setUserData(userDetails, redirectToLastUserPath);
                        if (redirectToLastUserPath) {
                            const lastUserPath = this.lastUserPath;
                            this.lastUserPath = '';
                            if (lastUserPath !== undefined && lastUserPath != null && lastUserPath !== '') {
                                const router = this.injector.get(Router);
                                router.navigateByUrl(lastUserPath);
                            }
                        }
                        resolve(true);
                    },
                    error => {
                        reject(error);
                    }
                );
        });
    }

    public setIsAuthenticated(isAuthenticated: boolean): void {
        this.isAuthenticated = isAuthenticated;
    }

    public getIsAuthenticated(): boolean {
        return this.isAuthenticated;
    }
}
