// External Imports
import { Injectable } from '@angular/core';
import { Subject } from "rxjs/Subject";

@Injectable({
    providedIn: 'root'
})

export class MessageService {
    // holds current displayed toasts
    public currentToasts: Array<any> = [];

    // holds message type class
    private typeClass: { success: string, error: string, info: string } = {
        success: 'bg-success text-light',
        error: 'bg-danger text-light',
        info: 'bg-info text-light'
    }

    // default toast options for server error.
    private defaultOptions: { type: string, message: string } = { type: "error", message: "Error while processing your request." };

    // emits value to toast conatiner when new toast added.
    public toastSubscription = new Subject();

    // // default messages
    // private defaultMessages: Array<any> = [
     
    // ];

    /**
     * @author Heena Bhesaniya
     * @description This method is used to displaying message
     * @param defaultMessage meesage text that need to be displayed in toaster
     * @param messageType message type  success/error/info
     * @param messageKey defalut message key
     * @param duration time duration in miliseconds
     */
    public showMessage(message?: string, type?: string, messageKey?: string, duration: number = 5000): void {
        // if (messageKey) {
        //     let relatedMessage = this.defaultMessages.find((obj: any) => { return obj.key === messageKey });
        //     if (relatedMessage) {
        //         message = relatedMessage.en;
        //         type = relatedMessage.type;
        //     }
        // }

        if (message) {
            this.currentToasts = [];
            this.currentToasts.push({ message: message, type: this.typeClass[type], duration: duration, id: this.generateUniqueId() });
            this.toastSubscription.next(this.currentToasts);
        }
    }

    /**
     * @author Hannan Desai
     * @description
     *          This function is used to generate unique number to assigned to each toast.
     */
    private generateUniqueId(): number {
        const uuid = Math.floor(Math.random() * 1000 + 1);
        let sameIdExists = this.currentToasts.find(obj => {
            return obj.id === uuid;
        });
        if (sameIdExists) {
            this.generateUniqueId();
        } else {
            return uuid;
        }
    }

    /**
     * @author Heena Bhesaniya
     * @description Remove toaster message
     * @param toast 
     */
    public hideMessage(id: number): void {
        this.currentToasts = this.currentToasts.filter(t => t.id !== id);
        this.toastSubscription.next(this.currentToasts);
    }

    //to clear all toaster
    public clear (): void {
        this.currentToasts = [];
        this.toastSubscription.next(this.currentToasts);
    }

}
