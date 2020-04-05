// External imports
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
// Intenal imports
import { LoaderService, LoaderState } from '@app/shared/loader/loader.service';

@Component({
    selector: 'ilink-loader',
    templateUrl: 'loader.component.html',
    styleUrls: ['loader.component.scss']
})

export class LoaderComponent implements OnInit, OnDestroy {
    show = false;
    private subscription: Subscription;

    constructor(private loaderService: LoaderService) { }

    ngOnInit() {
        this.subscription = this.loaderService.loaderState
            .subscribe((state: LoaderState) => {
                const self = this;
                setTimeout(() => {
                    self.show = state.show;
                }, 1);

            });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
