import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRouteSnapshot, NavigationEnd, RoutesRecognized, NavigationStart } from '@angular/router';

import { Title } from '@angular/platform-browser';
import { LocalStorageService } from 'ng2-webstorage';
import { StateStorageService, AuthServerProvider } from '../../shared';

@Component({
    selector: 'jhi-main',
    templateUrl: './main.component.html'
})
export class JhiMainComponent implements OnInit {

    constructor(
        private titleService: Title,
        private router: Router,
        private $storageService: StateStorageService,
        private authServerProvider: AuthServerProvider,
        private $localStorage: LocalStorageService
    ) {}

    private getPageTitle(routeSnapshot: ActivatedRouteSnapshot) {
        let title: string = (routeSnapshot.data && routeSnapshot.data['pageTitle']) ? routeSnapshot.data['pageTitle'] : 'pmApp';
        if (routeSnapshot.firstChild) {
            title = this.getPageTitle(routeSnapshot.firstChild) || title;
        }
        return title;
    }

    ngOnInit() {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                 this.titleService.setTitle(this.getPageTitle(this.router.routerState.snapshot.root));
            }
            if (event instanceof RoutesRecognized) {
                let params = {};
                let destinationData = {};
                let destinationName = '';
                let destinationEvent = event.state.root.firstChild.children[0];
                if (destinationEvent !== undefined) {
                    params = destinationEvent.params;
                    destinationData = destinationEvent.data;
                    destinationName = destinationEvent.url[0].path;
                }
                let from = {name: this.router.url.slice(1)};
                let destination = {name: destinationName, data: destinationData};
                this.$storageService.storeDestinationState(destination, params, from);
            }
            if (event instanceof NavigationStart && event.url === '/access_token') {
                this.authServerProvider.getLock().resumeAuth(window.location.hash, (error, authResult) => {
                    if (error) {
                        return console.log(error);
                    }

                    this.$localStorage.store('id_token', authResult.idToken);
                    this.router.navigate(['/']);
                });
            }
        });
    }
}
