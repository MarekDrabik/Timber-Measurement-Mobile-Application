import { CellAddress, CellBooleans, PropsPerRow, RowId } from "src/app/shared/types";
import { SelectedCells } from "src/app/state/state.types";
import { AVAILABLE_COLUMNS_ORDERED, DEFAULT_BOOLEANS } from "../../shared/shared-vars";
import { UtilsService } from "../shared/utils.service";

export class BooleanRowProperties {
  propsPerRow: PropsPerRow = {};
  previouslyMarked: {
    [prop in keyof CellBooleans]: CellAddress[];
  } = {
    isLocked: [], isModified: [], isSelected: [], isValid: []
  };

  private _unmarkObsolete (toBeMarked: CellAddress[], booleanProp: keyof CellBooleans) {
    //unmark all previously marked.
    const leftToUnmarkCells = UtilsService.arraysDifference<CellAddress, CellAddress>(this.previouslyMarked[booleanProp], toBeMarked);
    for (let toBeUnmarked of leftToUnmarkCells) {
      if (!this.propsPerRow[toBeUnmarked.rowId]) continue; //row was deleted
      const cellBooleans = this.propsPerRow[toBeUnmarked.rowId][toBeUnmarked.cellId];
      this.propsPerRow[toBeUnmarked.rowId] = { //make a new reference to trigger onPush detection
        ...this.propsPerRow[toBeUnmarked.rowId],
        [toBeUnmarked.cellId]: { 
          ...cellBooleans,
          [booleanProp]: DEFAULT_BOOLEANS[booleanProp],
        },
      }
    }
  }

  private _updateProperty(toBeMarkedCells: CellAddress[], booleanProp: keyof CellBooleans) {
    console.assert(
      (() => {
        for (let addr of toBeMarkedCells) {
          if (!(addr.rowId + "" in this.propsPerRow)) return false;
        }
        return true;
      })(),
      "all to be marked cells' rows need to already be registered by propsPerRow!"
    );
    console.assert(
      (() => {
        let currKeys = Object.keys(this.propsPerRow);
        let markedKeys = toBeMarkedCells.map((x) => x.rowId);
        for (let mar of markedKeys) if (!currKeys.includes(mar + "")) return false;
        return true;
      })(),
      "cannot have unregistered row marked!"
    );

    this._unmarkObsolete(toBeMarkedCells, booleanProp);

    let previousCell;
    for (let addr of toBeMarkedCells) {
      console.assert(
        this.propsPerRow[addr.rowId] != null && this.propsPerRow[addr.rowId][addr.cellId] != null,
        "Fatal error! Entry must already exist!"
      );
      //mark:
      previousCell = this.propsPerRow[addr.rowId][addr.cellId];
      let newCellInPropsPerRow = { ...previousCell, [booleanProp]: !DEFAULT_BOOLEANS[booleanProp] };
      this.propsPerRow[addr.rowId] = {
        //make a new reference to trigger onPush detection
        ...this.propsPerRow[addr.rowId],
        [addr.cellId]: newCellInPropsPerRow,
      };
    }
    this.previouslyMarked[booleanProp] = toBeMarkedCells;
  }

  markSelected(currentlySelected: SelectedCells) {
    this._updateProperty(currentlySelected, "isSelected");
  }
  markModified(currentlyModifed: CellAddress[]) {
    this._updateProperty(currentlyModifed, "isModified");
  }

  updateRowIdsList(newRowsOrder: RowId[]) {
    //I can do this update without special optimisations because it's not a frequent call
    const newPropsPerRow: PropsPerRow = {};
    for (let i = 0; i < newRowsOrder.length; i++) {
      for (let cellId = 0; cellId < AVAILABLE_COLUMNS_ORDERED.length; cellId++) {
        if (this.propsPerRow[newRowsOrder[i]])
          //row already existed
          newPropsPerRow[newRowsOrder[i]] = this.propsPerRow[newRowsOrder[i]];
        //newly added row => add empty propPerRow entry
        else
          newPropsPerRow[newRowsOrder[i]] = { ...newPropsPerRow[newRowsOrder[i]], [cellId]: { ...DEFAULT_BOOLEANS } };
      }
    }
    this.propsPerRow = newPropsPerRow;
  }
}
