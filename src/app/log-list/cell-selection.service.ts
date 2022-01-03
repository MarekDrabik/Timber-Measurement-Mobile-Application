import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HomePageStoreService } from "../home/home-page-store.service";
import { LicensingService } from "../shared/licensing.service";
import { CellAddress, RowId } from "../shared/types";
import { SelectedCell } from "../state/state.types";
import { AutostepService } from "./log-list-input/autostep-service";
import { LogListStoreService } from "./log-list-store.service";
import { RowsManipulationService } from "./rows-manipulation.service";
import { ActiveColumnsService } from "./shared/active-columns.service";

@Injectable()
export class CellSelectionService {

  scrollToBottom$ = new Subject<void>();

  constructor(
    private _activeColumnsService: ActiveColumnsService,
    private _storeService: LogListStoreService,
    private rowsManipulationService: RowsManipulationService,
    private _autostepService: AutostepService,
    private homeStoreServ: HomePageStoreService,
    private licenseServ: LicensingService,
  ) {}

  private _getSubsequentCellAddress(currentCell: CellAddress, rowsOrder: RowId[]) {
    let subsequent = this._activeColumnsService.getIdOfSubsequentCell(currentCell.cellId, this._storeService.DOCUMENT_ID);
    if (subsequent === null) return null; // case of all columns deactivated
    const positionOfCurrentRow = rowsOrder.findIndex((rowId) => rowId === currentCell.rowId);
    const currentRowIsLastRow = positionOfCurrentRow === rowsOrder.length - 1;

    const result = { ...subsequent, rowId: null, isInBrandNewRow: false };
    if (subsequent.isInNextRow) {
      if (currentRowIsLastRow) {
        const newRowId = this.homeStoreServ.getLastRowId() + 1;
        result.rowId = newRowId;
        result.isInBrandNewRow = true;
      } else {
        result.rowId = rowsOrder[positionOfCurrentRow + 1];
      }
    } else {
      result.rowId = currentCell.rowId;
    }
    return result;
  }

  selectSubsequentCell(currentlySelected: SelectedCell) {
    this.licenseServ.someUserInput$.next();
    this._autostepService.autostepProgressEnd$.next(); //kill autostep progress
    const rowsOrder = this._storeService.getRowsOrder();
    //console.log('rowsOrder:', rowsOrder)
    let subsequent = this._getSubsequentCellAddress(currentlySelected, rowsOrder);
    if (subsequent === null) { // case of all columns deactivated
      this._storeService.unselectCells()
      return;
    };
    if (subsequent.isInBrandNewRow) this.rowsManipulationService.createNewRow(subsequent.rowId);
    setTimeout(() => {
      //timeout to fix flickering list bug. Assuming it was caused by premature scrollIntoView.
      this._storeService.selectOneCell({ cellId: subsequent.cellId, rowId: subsequent.rowId });
    }, 0);
    
  }
}
