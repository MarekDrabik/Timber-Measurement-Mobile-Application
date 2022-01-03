import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component, Input,
  OnDestroy,
  SimpleChanges,
  ViewChild
} from "@angular/core";
import { IonItemSliding } from "@ionic/angular";
import { DocumentStoreService } from "src/app/document/document-store.service";
import { ActiveColumnsService } from "src/app/log-list/shared/active-columns.service";
import { SharedVarsService } from "src/app/shared/shared-vars.service";
import { ActivatedColumns, PropsPerRow, Row, RowId, SummaryList } from "src/app/shared/types";
import { LogListStoreService } from "../log-list-store.service";
import { ColorService } from "../log-list-summary/color.service";
import { AlertPopupService } from "../shared/alert-popup.service";
import { TableService } from "../table.service";

@Component({
  selector: "app-log-list-row",
  templateUrl: "./log-list-row.component.html",
  styleUrls: ["./log-list-row.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogListRowComponent implements OnDestroy {
  @Input() row: Row;
  @Input() propsPerCell: PropsPerRow[keyof PropsPerRow];
  @Input() summaryRow: SummaryList[keyof SummaryList];
  @Input() activatedColumns: ActivatedColumns | {} = {};
  @Input() showNote: boolean;
  @Input() noteIconSvg: string;
  @ViewChild("slidingRef", {read: IonItemSliding}) slidingRef: IonItemSliding;
  private CLOSE_SLIDING_DELAY = 200;
  private _manualyCrossedOutSvg: string; //keeps same image for this row, not changing it on userInput
  crossedOutSvg: string;
  noteColor: string;

  constructor(
    public activeColumnsService: ActiveColumnsService,
    public x: SharedVarsService,
    private _alertPopupService: AlertPopupService,
    private _storeService: LogListStoreService,
    public colorService: ColorService,
    private _tableService: TableService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.hasOwnProperty("row")) {
      this._setCrossedOutSvg(changes);
      this.noteColor = this._tableService.notesColors[this.row.id];
    }
  }

  crossOut(rowId: RowId) {
    this._storeService.toggleRowCrossedOut(rowId);
    setTimeout(() => this.slidingRef.close(), this.CLOSE_SLIDING_DELAY);
  }

  private _setCrossedOutSvg(changes: SimpleChanges) {
    console.assert(changes.row.currentValue.isCrossedOut != null);
    const [crossedOut, unTouched] = [changes.row.currentValue.isCrossedOut, changes.row.currentValue.isUntouched];
    if (crossedOut) {
      if (!this._manualyCrossedOutSvg) {
        this._manualyCrossedOutSvg = this.colorService.crossOutSvg(true);
      }
      this.crossedOutSvg = this._manualyCrossedOutSvg;
    } else if (unTouched) {
      this.crossedOutSvg = this.colorService.crossOutSvg(false);
    } else {
      this.crossedOutSvg = null;
    }
  }

  deleteRow() {
    this._alertPopupService.deleteRow(
      () => {
        this.slidingRef.close();
        this._storeService.deleteRow(this.row.id);
      },
      () => {
        setTimeout(() => this.slidingRef.close(), this.CLOSE_SLIDING_DELAY);
      }
    );
  }

  ngOnDestroy(): void {}
}
