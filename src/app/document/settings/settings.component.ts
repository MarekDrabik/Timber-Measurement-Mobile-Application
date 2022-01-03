import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import Big from 'big.js';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { GlobalStoreService } from 'src/app/shared/global-store.service';
import { UnsubscriptionService } from 'src/app/shared/unsubscription.service';

@Component({
  selector: 'app-settings-popover',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsPopoverComponent implements OnInit {
  
  rangeControl = new FormControl(this.globalStoreServ.getAutostepSpeed()) 
  private _subs: Subscription[] = [];

  constructor(private globalStoreServ: GlobalStoreService, private unsubServ: UnsubscriptionService) { }

  ngOnInit() {
    this._subs.push(this.rangeControl.valueChanges.pipe(debounceTime(500)).subscribe(v => {
      this.globalStoreServ.setAutostepSpeed(v);
    })) 
  }

  toSeconds(miliseconds: number) {
    return Big(miliseconds).div(1000).toFixed(2)
  }

  ngOnDestroy(): void {
    this.unsubServ.unsubscribeFromArray(this._subs);
  }
}
