import { CdkVirtualScrollViewport } from "@angular/cdk/scrolling";
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  Input,
  OnInit,
  SimpleChanges,
  TrackByFunction,
  ViewChild,
} from "@angular/core";
import { Capacitor } from "@capacitor/core";
import { Keyboard } from "@capacitor/keyboard";
import { combineLatest, Subscription } from "rxjs";
import { debounceTime, filter, tap } from "rxjs/operators";
import { DocumentStoreService } from "src/app/document/document-store.service";
import { GlobalStoreService } from "src/app/shared/global-store.service";
import { SharedVarsService } from "src/app/shared/shared-vars.service";
import {
  ActivatedColumns,
  CellAddress,
  CellId,
  ColumnPropertyValue,
  CustomMouseEvent,
  Row,
  RowId,
  SummaryList,
  SummaryRow,
} from "src/app/shared/types";
import { UnsubscriptionService } from "src/app/shared/unsubscription.service";
import { LogListModes, SelectedCells } from "src/app/state/state.types";
import { CellSelectionService } from "../cell-selection.service";
import { LogListStoreService } from "../log-list-store.service";
import { ColorService } from "../log-list-summary/color.service";
import { DomService } from "../shared/dom.service";
import { UtilsService } from "../shared/utils.service";
import { SummaryView } from "../summary-view";
import { SummaryService } from "../summary.service";
import { TableService } from "../table.service";
import { BooleanRowProperties } from "./boolean-row-properties";

@Component({
  selector: "app-log-list-table",
  templateUrl: "./log-list-table.component.html",
  styleUrls: ["./log-list-table.component.scss"],
})
export class LogListTableComponent implements OnInit {
  @ViewChild(CdkVirtualScrollViewport, { read: CdkVirtualScrollViewport, static: true })
  scrollViewport: CdkVirtualScrollViewport;
  @Input() activatedColumns: ActivatedColumns | {} = {};

  SCROLL_ITEM_SIZE = 32;
  MIN_BUFFER = 640;
  MAX_BUFFER = 1000;

  showLoading = false;
  rows: (Row | SummaryRow)[] = [];
  rowBoolProperties = new BooleanRowProperties();
  summaryList: SummaryList = null;
  summary: SummaryView | null = null;
  endingGapHeight: number = 3;
  showNotes: boolean = false;
  notesIcons: {
    [id in RowId]: string;
  };

  private _subs: Subscription[] = [];

  constructor(
    private domService: DomService,
    private _storeService: LogListStoreService,
    public x: SharedVarsService,
    private _globalStoreService: GlobalStoreService,
    private detector: ChangeDetectorRef,
    private _summaryService: SummaryService,
    public colorService: ColorService,
    private unsubService: UnsubscriptionService,
    private _documentStoreService: DocumentStoreService,
    private cellSelectionServ: CellSelectionService,
    private tableServ: TableService
  ) {}

  ngOnInit() {
    this.detector.detach();
    this._onRowsManipulationOrValueUpdateUpdateRows();
    this._onRowsManipulationUpdateBooleansList();
    this._listenForCellsModification();
    this._listenForSummaryUpdates();
    this._observeModesAndChangeGapHeight();
    this._observeScrollToBottomRequest();
  }

  ngAfterViewInit(): void {
    this._onScrollReatachChangeDetector();
    this._observeCellSelection();
    this._observeKeyboardOpenToScrollIntoView();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty("activatedColumns")) {
      this.detector.detectChanges();
    }
  }

  trackByFun: TrackByFunction<Row> = (i, row: Row) => {
    return row.id;
  };

  @HostListener("mousedown", ["$event"]) //do not use mousedown as it conflicts with scrolling
  onMousedown(event: CustomMouseEvent) {
    event.preventDefault(); //do not blur input
  }

  @HostListener("click", ["$event"]) //do not use mousedown as it conflicts with scrolling
  onClick(event: CustomMouseEvent) {
    //catches only clicks on its descendant elements (rows of logs)
    this._onUserCellClick(event);
  }

  @HostListener("contextmenu", ["$event"])
  onContextMenu(event: CustomMouseEvent) {
    event.preventDefault(); //do not show context menu
    const cellAddress = this.domService.getClickedCellAddress(event);
    this._summarizeBy(cellAddress.cellId);
    this._toggleSummaryAndScrollIntoView(cellAddress);
  }

  isSummaryRow(row: Row | SummaryRow) {
    return row.hasOwnProperty("isSummary");
  }

  private _observeScrollToBottomRequest() {
    this._subs.push(
      this.cellSelectionServ.scrollToBottom$.subscribe(() => {
        this.scrollViewport.scrollTo({ bottom: 0, behavior: "smooth" });
      })
    );
  }

  private _observeKeyboardOpenToScrollIntoView() {
    if (Capacitor.isPluginAvailable("Keyboard"))
      Keyboard.addListener("keyboardDidShow", () => {
        const selectedCell = this._storeService.getSelectedCells() && this._storeService.getSelectedCells()[0];
        if (selectedCell != null) this._scrollCellIntoView(selectedCell.rowId);
      });
  }

  private _observeModesAndChangeGapHeight() {
    this._subs.push(
      combineLatest([
        this._documentStoreService.rowSelectionMode$,
        this._globalStoreService.observeCopiedRowsOn(),
      ]).subscribe(([rowSelection, copiedRows]) => {
        let gapHeight = 3;
        if (rowSelection.isOn) {
          if (rowSelection.isMinimised) gapHeight += 1.5;
          else gapHeight += 3;
        }
        if (copiedRows === true) {
          gapHeight += 3;
        }
        this.endingGapHeight = gapHeight;
        this.detector.detectChanges();
      })
    );
  }

  private _listenForSummaryUpdates() {
    this._subs.push(
      this._summaryService.summaryUpdates$.subscribe((summary) => {
        this.summary = summary;
        if (summary) {
          this._renderSummaryChanges();
        } else {
          this._unloadSummary();
        }
      })
    );
  }

  private _listenForCellsModification() {
    this._subs.push(
      this._storeService.modifiedCells$.subscribe((cells) => {
        this.rowBoolProperties.markModified(cells);
        //not calling detectChanges because it is called by _onRowsManipulationOrValueUpdateUpdateRows for each update
      })
    );
  }

  private _renderSummaryChanges = () => {
    this.rows = this.summary.rowsAndSummaryRows;
    this.summaryList = this.summary.summaryList;
    this.detector.detectChanges();
  };

  private _unloadSummary() {
    this.rows = this._storeService.getAllCurrentRows();
    this.summary = null;
    this.summaryList = null;
    this.detector.detectChanges();
  }

  private _onScrollReatachChangeDetector() {
    let scrollStarted = false;
    this._subs.push(
      //otherwise rows will not be rendered by virtual scroll
      this.scrollViewport
        .elementScrolled()
        .pipe(
          tap((_) => {
            if (!scrollStarted) {
              console.log("scroll started");
              scrollStarted = true;
              this.detector.reattach();
            }
          }),
          debounceTime(200)
        )
        .subscribe((_) => {
          console.log("scroll ended");
          scrollStarted = false;
          this.detector.detach();
        })
    );
  }

  private _onUserCellClick(event: CustomMouseEvent) {
    const cellAddress = this.domService.getClickedCellAddress(event);
    if (!cellAddress) {
      return;
    }
    if (this.summary) {
      //during Summary Mode show/hide associated summary row
      this._toggleSummaryAndScrollIntoView(cellAddress);
    } else {
      //during standard Mode select cell
      this._storeService.selectOneCell(cellAddress);
      const rowSelectionState = this._documentStoreService.getMode("rowSelection") as LogListModes["rowSelection"];
      if (rowSelectionState.isOn && !rowSelectionState.isMinimised) {
        this._documentStoreService.setSelectionMinimised(true);
        this._documentStoreService.setModeOnOff("standard", true);
      }
    }
  }

  private _toggleSummaryAndScrollIntoView(cellAddress: CellAddress) {
    // this._summarizeBy(cellAddress.cellId);
    const toggledSummaryRow = this._toggleSummaryRow(cellAddress);
    if (!!toggledSummaryRow) this._scrollCellIntoView(toggledSummaryRow.id);
  }

  private _summarizeBy(cellId: CellId) {
    if (!this.summary) this._summaryService.initiateSummary();
    let propertyName = UtilsService.cellIdToPropertyName(+cellId);
    if (this.summary != null && this.summary.summarizedBy.includes(propertyName)) return; //do not summarizy by column which is already applied
    this._summaryService.summarizeBy(propertyName as keyof ColumnPropertyValue);
  }

  private _toggleSummaryRow(cellAddress: CellAddress) {
    let propertyName = UtilsService.cellIdToPropertyName(cellAddress.cellId);
    let clickedCellSummary = this.summaryList[cellAddress.rowId][propertyName];
    if (!clickedCellSummary || !clickedCellSummary.inIdentity) return { id: cellAddress.rowId }; //only cells in identity have summary
    const toggledSummaryRow = this.summary.toggleSummaryRow(clickedCellSummary);
    this.rows = this.summary.rowsAndSummaryRows;
    this.detector.detectChanges();
    return toggledSummaryRow;
  }

  private _scrollCellIntoView(rowId: number, smooth: boolean = true) {
    const GAP_ROWS_COUNT = 4;
    const rowOrder = this.rows.findIndex((row) => row.id === rowId);
    if (rowOrder === -1) return;
    if (rowOrder < GAP_ROWS_COUNT) {
      this.scrollViewport.scrollTo({ top: 0, behavior: smooth ? "smooth" : "auto" });
    } else if (rowOrder + GAP_ROWS_COUNT >= this.rows.length) {
      this.scrollViewport.scrollTo({ bottom: 0, behavior: smooth ? "smooth" : "auto" });
    } else {
      this.scrollViewport.scrollToIndex(rowOrder - GAP_ROWS_COUNT, smooth ? "smooth" : "auto");
    }
  }

  private _observeCellSelection() {
    let isFirstEmit = true;
    this._subs.push(
      this._storeService.selectedCellsChange$.subscribe((selectedCells: SelectedCells) => {
        if (isFirstEmit) {
          isFirstEmit = false;
        } else {
          if (selectedCells.length > 0) {
            this._scrollCellIntoView(selectedCells[selectedCells.length - 1].rowId as number);
          }
        }
        this._showNotesTextsIfFocused(selectedCells);
        this.rowBoolProperties.markSelected(selectedCells);
        this.detector.detectChanges();
      })
    );
  }

  private _showNotesTextsIfFocused(selectedCells: SelectedCells) {
    if (selectedCells.length > 0 && UtilsService.cellIdToPropertyName(selectedCells[0].cellId) === "logNote")
      this.showNotes = true;
    else this.showNotes = false;
  }

  private _onRowsManipulationUpdateBooleansList() {
    this._subs.push(
      this._storeService.rowsOrderChange$.subscribe((rowsOrder: RowId[]) => {
        //I am not using combined selector (RowsOrder + Rows)
        //cause I dont want to trigger this on values changes
        this.rowBoolProperties.updateRowIdsList(rowsOrder);
      })
    );
  }

  private _onRowsManipulationOrValueUpdateUpdateRows() {
    // callback();
    setTimeout(() => {
      this._subs.push(
        this._storeService.allRowsChange$
          .pipe(
            filter(() => this.summary == null), //ignore update during summary mode (row selection)
            tap()
          )
          .subscribe((rows: Row[]) => {
            this.tableServ.storeCurrentNotesColoring(rows, this.rows as Row[]);
            console.log("updating list rows from:", this.rows, "to:", rows);
            this.rows = rows;
            this.notesIcons = this.tableServ.noteIconsFullSvgs;
            this.detector.detectChanges();
          })
      );
    }, 0);
  }

  ngOnDestroy(): void {
    this.unsubService.unsubscribeFromArray(this._subs);
    this.unsubService.assertUnsubscribedArray(this._subs);
    if (Capacitor.isPluginAvailable("Keyboard")) Keyboard.removeAllListeners();
  }
}
