// External Import
import { Component, OnInit } from '@angular/core';

// Internal Import
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'app-setting-detail',
  templateUrl: './setting-detail.component.html',
  styleUrls: ['./setting-detail.component.scss']
})
export class SettingDetailComponent implements OnInit {

  public userDetails: any = {};

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userDetails = this.userService.getUserDetail();
  }

}
