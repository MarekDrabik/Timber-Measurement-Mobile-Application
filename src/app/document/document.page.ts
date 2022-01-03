import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { PopoverController } from "@ionic/angular";
import { Subscription } from "rxjs";
import { CellSelectionService } from "../log-list/cell-selection.service";
import { HeaderStoreService } from "../log-list/header-store.service";
import { LogListStoreService } from "../log-list/log-list-store.service";
import { RowsManipulationService } from "../log-list/rows-manipulation.service";
import { SuggestedValuesService } from "../log-list/shared/suggested-values.service";
import { SummaryService } from "../log-list/summary.service";
import { TableService } from "../log-list/table.service";
import { DocVolumeService } from "../print/doc-volume.service";
import { PdfAdjustmentsService } from "../print/pdf-adjustments.service";
import { PdfRowsDistributionService } from "../print/pdf-rows-distribution.service";
import { MeasurementsService } from "../print/pdfMakeObjects/measurements.service";
import { PdfMakeService } from "../print/pdfMakeObjects/pdf-make.service";
import { PrintService } from "../print/print.service";
import { ItemSlidingService } from "../shared/sliding-item/item-sliding.service";
import { UnsubscriptionService } from "../shared/unsubscription.service";
import { AutoFillService } from "./auto-fill.service";
import { AutoUpdatedFieldsService } from "./auto-updated-fields.service";
import { DocumentStoreService } from "./document-store.service";
import { SettingsPopoverComponent } from "./settings/settings.component";

@Component({
  selector: "app-document",
  templateUrl: "./document.page.html",
  styleUrls: ["./document.page.scss"],
  providers: [
    DocumentStoreService,
    LogListStoreService,
    HeaderStoreService,
    CellSelectionService,
    RowsManipulationService,
    SummaryService,
    DocVolumeService,
    AutoFillService,
    SuggestedValuesService,
    ItemSlidingService,
    PrintService,
    PdfAdjustmentsService,
    MeasurementsService,
    PdfMakeService,
    PdfRowsDistributionService,
    TableService,
    AutoUpdatedFieldsService,
  ],
})
export class DocumentPage {

  quickname: string;
  tabBarCollapsed = false;
  private _modifyUIPresented: boolean;
  private _subs: Subscription[] = [];

  constructor(
    private router: Router,
    public headerStoreService: HeaderStoreService,
    private _unsubServ: UnsubscriptionService,
    private docStoreServ: DocumentStoreService,
    private popoverController: PopoverController,
    private loglistServ: LogListStoreService,
    private _itemSlidingService: ItemSlidingService,
  ) {
    this._subs.push(this.headerStoreService.headerFieldChanges$.subscribe((headers) => {
      this.quickname = headers.quickName.value;
    }));

    this._observeStandardModeToCollapseTabBar();
    this._observeCellSelectionToCloseSlidings();
  }

  private _observeCellSelectionToCloseSlidings() {
    this.loglistServ.selectedCellsChange$.subscribe(_ => {
      this._itemSlidingService.sliding$.next({
        rowId: null,
        position: 'close'
      })
    })
  }

  private _observeStandardModeToCollapseTabBar() {
    this._subs.push(this.docStoreServ.loglistModes$.subscribe(ev => {
      if (ev.standard.isOn === true) {
        this.tabBarCollapsed = true;
      } else {
        this.tabBarCollapsed = false;
      }
    }))
  }

  async presentSettingsPopover() {
    if (this._modifyUIPresented === true) return;
    this._modifyUIPresented = true;
    const popover = await this.popoverController.create({
      component: SettingsPopoverComponent,
      translucent: true,
    })
    await popover.present();
    await popover.onDidDismiss().then(() => {
      this._modifyUIPresented = false;
    });
  }

  redirectHome() {
    this.router.navigate(["/home"]);
  }

  ngOnDestroy(): void {
    this._unsubServ.unsubscribeFromArray(this._subs);
  }
}
