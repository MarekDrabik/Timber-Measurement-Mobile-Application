import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot } from "@angular/router";
import { Store } from "@ngrx/store";
import { CoreStorageService } from "./shared/core-storage.service";
import { FixStorageService } from "./shared/fix-storage.service";
import { StorageService } from "./shared/storage.service";

@Injectable({
  providedIn: "root",
})
export class LoadStoreGuard implements CanActivate {
  constructor(
    private _store: Store,
    private _storageService: StorageService,
    private _fixStorageService: FixStorageService,
    private _coreStorageServ: CoreStorageService //called here to get initialized
  ) {}

  loaded: boolean = false;

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {
    if (this.loaded) return true;
    return new Promise((resolve) => {
      this._fixStorageService
        .fixStorage()
        .then(() => {
          return this._loadStore();
        })
        .then(() => {
          resolve(true);
        });
    });
  }

  private _loadStore = () => {
    console.log("loading store");
    return this._storageService.retrieveActiveDBName().then((dbName) =>
      //dbName is Debug if there is none other
      this._storageService.setActiveDBName(dbName).then((_) => {
        //setActiveDBName will reload whole database
        this.loaded = true;
      })
    );
  };
}
