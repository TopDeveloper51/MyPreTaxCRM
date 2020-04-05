// External imports
import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
@Component({
  selector: 'app-profile-info',
  templateUrl: './profile-info.component.html',
  styleUrls: ['./profile-info.component.scss']
})
export class ProfileInfoComponent implements OnInit {

  constructor(private model:NgbActiveModal) { }

   /**
* @author Satyam Jasoliya
* @createdDate 31-01-2020
* @description this method is close dialog
* @memberof ProfileInfoComponent
*/
  close()
  {
    this.model.close();
  }
  
  ngOnInit() {
  }

}
