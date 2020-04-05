
// External imports
import { Injectable } from '@angular/core';
import { Clipboard } from 'ts-clipboard';

@Injectable({
    providedIn: 'root'
})

export class CopyToClipboardService {
    constructor() { }

    public copy(copyText: string): void {
        Clipboard.copy(copyText);
    }
};