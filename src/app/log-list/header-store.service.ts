import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import { DocumentHeaderField } from "../shared/types";
import * as fromDocumentHeaderActions from "../state/header/header.actions";
import * as fromDocumentHeaderSelectors from "../state/header/header.selectors";
import { DocumentsHeaders, HeadersState } from "../state/state.types";
import { LogListStoreService } from "./log-list-store.service";

@Injectable()
export class HeaderStoreService {
  readonly DOCUMENT_ID: number;
  headerFieldChanges$: Observable<HeadersState[keyof HeadersState]>;
 
  constructor(documentStoreService: LogListStoreService, private _store: Store) {
    this.DOCUMENT_ID = documentStoreService.DOCUMENT_ID;
    this.headerFieldChanges$ = this._observeHeaderChanges();
  }
  
  private _observeHeaderChanges() {
    return this._store.select(fromDocumentHeaderSelectors.selectDocumentHeader, { documentId: this.DOCUMENT_ID });
  }

  getDocumentHeader() {
    let headerValues: DocumentsHeaders;
    this.headerFieldChanges$.pipe(take(1)).subscribe((val) => {
      console.log('headerValues', val)
      headerValues = val;
    });
    return headerValues;
  }

  setFieldValue(fieldName: DocumentHeaderField, value: string) {
    this._store.dispatch(
      fromDocumentHeaderActions.setField({
        documentId: this.DOCUMENT_ID,
        fieldName,
        value,
      })
    );
  }
  setMultipleFields (fields: DocumentHeaderField[], value: string) {
    this._store.dispatch(
      fromDocumentHeaderActions.setMultipleFields({
        documentId: this.DOCUMENT_ID,
        fields,
        value,
      })
    );
  }

  isAllHeaderValuesConfirmed() {
    let allConfirmed = true;
    const currentValues = this.getDocumentHeader();
    for (let h in currentValues) {
      if (currentValues[h].hasOwnProperty("initial") && currentValues[h].initial === true) {
        allConfirmed = false;
      }
    }
    return allConfirmed;
  }
}
