import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ServiceWorkerService } from '@app/shared/services/service-worker.service';
@Component({
  selector: 'app-new-version-release',
  templateUrl: './new-version-release.component.html',
  styleUrls: ['./new-version-release.component.scss']
})
export class NewVersionReleaseComponent implements OnInit {

  constructor(private model:NgbActiveModal,
    private serviceWorkerService:ServiceWorkerService) { }

  public reloadApplication() {
    this.serviceWorkerService.updateVersion();
  }

  public close()
  {
    this.model.close();
  }

  ngOnInit(): void {
  }

}
