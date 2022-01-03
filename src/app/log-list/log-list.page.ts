import { Component, HostListener } from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { combineLatest, Subscription } from "rxjs";
import { filter, skip, startWith, tap } from "rxjs/operators";
import { DocumentStoreService } from "../document/document-store.service";
import { GlobalStoreService } from "../shared/global-store.service";
import { RouteObservingService } from "../shared/route-observer.service";
import { ActivatedColumns, ColumnPropertyValue } from "../shared/types";
import { UnsubscriptionService } from "../shared/unsubscription.service";
import { LogListModes } from "../state/state.types";
import { CellSelectionService } from "./cell-selection.service";
import { LogListStoreService } from "./log-list-store.service";
import { ActiveColumnsService } from "./shared/active-columns.service";
import { SummaryService } from "./summary.service";

@Component({
  selector: "app-log-list",
  templateUrl: "./log-list.page.html",
  styleUrls: ["./log-list.page.scss"],
})
export class LogListPage {
  modes = {
    rowSelection: false,
    standard: false,
    summary: false,
    copiedRows: 0,
  };
  locateButtonStyle: "arrow" | "target";
  activatedColumns: ActivatedColumns = {
    logNote: false,
    logNumber: false,
    logDiameter: false,
    logLength: false,
    logQuality: false,
    logType: false,
    logVolume: false,
  };

  private _subs: Subscription[] = [];

  constructor(
    private activeColumnsService: ActiveColumnsService,
    public storeService: LogListStoreService,
    public globalStoreService: GlobalStoreService,
    private _cellSelectionService: CellSelectionService,
    private unsubService: UnsubscriptionService,
    private _summaryService: SummaryService,
    public docStoreService: DocumentStoreService,
    private routeObsServ: RouteObservingService
  ) {
    this.docStoreService.setModeOnOff("standard", false); //always start with collapsed input panel
    this._keyboardEvents();
  }

  ngOnInit(): void {
    this.observeColumnActivationConditions();
    this._onCellSelectionActivateStandardModeMinimiseSelection();
    this._observeKeyboardToTurnOffStandardMode();
    this._observeSelectionMaximisedToTurnOffStandardMode();
    this._observeModes();
  }

  @HostListener("keydown", ["$event"])
  enterKeyOnSelectedCell(ev: KeyboardEvent) {
    /* this a bug fix when enter key was ignored on input in case where 
    user clicks on outside element (such as recommended value) and immediatly on 'enter' key */
    if (ev.key === "Enter") {
      const currentlySelected = this.storeService.getSelectedCells();
      if (currentlySelected.length === 1) this._cellSelectionService.selectSubsequentCell(currentlySelected[0]);
    }
  }

  onLocateButton(ev: MouseEvent) {
    const selectedCells = this.storeService.getSelectedCells();
    if (!(this.docStoreService.getMode("rowSelection") as LogListModes["rowSelection"]).isMinimised) {
      //minimise row selection
      this.docStoreService.setSelectionMinimised(true);
    }
    if (selectedCells != null && selectedCells.length > 0) {
      //reselect selected
      this.storeService.selectOneCell(selectedCells[0]);
    } else {
      this._scrollToBottom();
    }
  }

  private _scrollToBottom() {
    this._cellSelectionService.scrollToBottom$.next();
  }

  private _observeSelectionMaximisedToTurnOffStandardMode() {
    this._subs.push(
      this.docStoreService.rowSelectionMode$.subscribe({
        next: (rowSelection) => {
          if (rowSelection.isMinimised === false) {
            this.docStoreService.setModeOnOff("standard", false);
          }
        },
      })
    );
  }

  private _observeKeyboardToTurnOffStandardMode() {
    this._subs.push(
      this.routeObsServ.keyboard$
        .pipe(filter((ev) => ev === "hid"))
        .subscribe((_) => this.docStoreService.setModeOnOff("standard", false))
    );
  }

  private _onCellSelectionActivateStandardModeMinimiseSelection() {
    this._subs.push(
      this.storeService.selectedCellsChange$
        .pipe(
          tap((addresses) => {
            if (addresses.length === 1) {
              this.locateButtonStyle = "target";
            } else {
              this.locateButtonStyle = "arrow";
            }
          }),
          skip(1) //skip initial value to not trigger standard mode
        )
        .subscribe((addresses) => {
          if (addresses.length === 1) {
            const rowSelection = this.docStoreService.getMode("rowSelection") as LogListModes["rowSelection"];
            if (!rowSelection.isOn || rowSelection.isMinimised) {
              //do not trigger standard mode if cell selected during row selection
              this.docStoreService.setModeOnOff("standard", true);
            }
          } else {
            this.docStoreService.setModeOnOff("standard", false);
          }
        })
    );
  }

  private _keyboardEvents() {
    if (Capacitor.isPluginAvailable("Keyboard")) {
      Keyboard.addListener("keyboardDidHide", () => {
        if (this.routeObsServ.isListRoute()) {
          this.routeObsServ.keyboard$.next("hid");
        }
      });
    }
  }

  private _observeModes() {
    this._subs.push(
      this._summaryService.summaryUpdates$.subscribe((s) => {
        this.modes.summary = s == null ? false : true;
      }),
      this.docStoreService.standardMode$.subscribe((mode) => {
        this.modes.standard = mode.isOn;
      }),
      this.docStoreService.rowSelectionMode$.subscribe((mode) => {
        this.modes.rowSelection = mode.isOn;
      }),
      this.globalStoreService.copiedRows$.subscribe((rows) => {
        this.modes.copiedRows = rows.length;
      })
    );
  }

  private observeColumnActivationConditions() {
    const setAll = (activated: boolean) => {
      let newCols = {}; //for one hit change detection
      for (let p in this.activatedColumns) newCols[p] = activated;
      return newCols as ActivatedColumns;
    };
    const activateIncluded = (newActCols: (keyof ColumnPropertyValue)[]) => {
      const newCols = setAll(false);
      for (let c of newActCols) newCols[c] = true;
      this.activatedColumns = newCols;
    };
    this._subs.push(
      combineLatest([
        this.activeColumnsService
          .observeActivatedColumns(this.storeService.DOCUMENT_ID)
          .pipe(tap((x) => console.warn("activated columns emit"))),
        this._summaryService.summaryUpdates$.pipe(startWith(0)),
      ]).subscribe(([activatedColumns, summary]) => {
        if (!!summary) this.activatedColumns = setAll(false);
        else activateIncluded(activatedColumns);
      })
    );
  }

  ngOnDestroy(): void {
    if (Capacitor.isPluginAvailable("Keyboard")) Keyboard.removeAllListeners();
    this.unsubService.unsubscribeFromArray(this._subs);
  }
}
