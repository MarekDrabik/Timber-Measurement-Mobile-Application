import { Component, TrackByFunction } from "@angular/core";
import { Router } from "@angular/router";
import { PopoverController } from "@ionic/angular";
import { Store } from "@ngrx/store";
import { map } from "rxjs/operators";
import { UtilsService } from "../log-list/shared/utils.service";
import { FixStorageService } from "../shared/fix-storage.service";
import { GlobalStoreService } from "../shared/global-store.service";
import { LicensingService } from "../shared/licensing.service";
import { RemoteMemoryService } from "../shared/remote-memory.service";
import { StorageService } from "../shared/storage.service";
import { setField } from "../state/header/header.actions";
import { DocumentsHeaders, HeadersState } from "../state/state.types";
import { HomePageStoreService } from "./home-page-store.service";
import { NewDocumentPopoverComponent } from "./new-document-popover/new-document-popover.component";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage {
  headers: (DocumentsHeaders & { documentId: number; createdAt: number })[];
  debugOn: boolean = false;
  activeDB = null;

  private _subs = [];
  private _newDocPopoverPresented: boolean = false;

  constructor(
    private _store: Store,
    private _homePageStoreService: HomePageStoreService,
    private _storageService: StorageService, //for initialisation only
    private globalStoreServ: GlobalStoreService,
    public remoteMemoryServ: RemoteMemoryService,
    private licensingService: LicensingService,
    private popoverController: PopoverController,
    private router: Router
  ) {
    this._listenForHeadersChange(); //previously called in setTimeout in ngAfterViewInit
    this._updateSelectorDBName();
  }

  private _updateSelectorDBName() {
    this._storageService.retrieveActiveDBName().then((newDBName) => (this.activeDB = newDBName));
  }

  private _listenForHeadersChange() {
    this._subs.push(
      this._homePageStoreService.headersChange$
        .pipe(map((headers: HeadersState) => this._headersByCreationTime(headers)))
        .subscribe((headers) => (this.headers = headers))
    );
  }

  private _headersByCreationTime(headers: HeadersState) {
    const docsSettings = this._homePageStoreService.getDocsSettings(); //memoized settings
    const sortedSettings = Object.values(docsSettings).sort((a, b) => b.createdAt - a.createdAt);
    return sortedSettings.map((settings) => {
      return { ...headers[settings.documentId], documentId: settings.documentId, createdAt: settings.createdAt };
    });
  }

  private setDocumentQuickname = (documentId: number, value: string) => {
    this._store.dispatch(
      setField({
        documentId,
        fieldName: "quickName",
        value,
      })
    );
  };

  onAddClick() {
    const newDocId = this._homePageStoreService.createNewDocument();
    this.displayNewDocumentPopup(newDocId);
  }

  async displayNewDocumentPopup(newDocId) {
    if (this._newDocPopoverPresented === true) return;
    this._newDocPopoverPresented = true;
    const popover = await this.popoverController.create({
      component: NewDocumentPopoverComponent,
      componentProps: {
        documentId: newDocId,
        onCancelPopover: () => {
          this.globalStoreServ.deleteDocument(newDocId);
          popover.dismiss();
        },
        onQuicknameChange: (quickname: string) => {
          this.setDocumentQuickname(newDocId, quickname);
        },
        onDismiss: () => {
          popover.dismiss();
          this.router.navigate([`/document/${newDocId}/list`]);
        },
      },
      cssClass: "notePopover",
      translucent: true,
    });
    await popover.present();
    await popover.onDidDismiss().then(() => {
      this._newDocPopoverPresented = false;
    });
  }

  onCogsClick() {
    if (this.debugOn === true) {
      this.debugOn = false; //close debug menu
    } else {
      this.licensingService.presentLicensePopover();
    }
  }

  trackByFun: TrackByFunction<DocumentsHeaders & { documentId: number; createdAt: number }> = (i, item) => {
    return item.documentId;
  };

  changeDatabase(event: CustomEvent) {
    //on user manual change
    const newDbName = event.detail.value;
    this._storageService.setActiveDBName(newDbName).then(() => (this.activeDB = newDbName));
  }

  ngOnDestroy(): void {
    this._subs.forEach((s) => s.unsubscribe());
  }
}
