import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { Observable } from "rxjs";
import { take } from "rxjs/operators";
import * as x from "../shared/shared-vars";
import * as fromAppActions from "../state/app.actions";
import * as fromDocsSettingsSelectors from "../state/documentsSettings/docsSettings.selectors";
import * as fromHeaderSelectors from "../state/header/header.selectors";
import * as fromLatestIdsSelections from "../state/latest-ids/latest-ids.selectors";
import { DocsSettingsState, HeadersState } from "../state/state.types";

@Injectable({
  providedIn: "root",
})
export class HomePageStoreService {
  public headersChange$: Observable<HeadersState>;

  constructor(private _store: Store) {
    this.headersChange$ = this.observeHeaders();
  }

  private observeHeaders(): Observable<HeadersState> {
    return this._store.select(fromHeaderSelectors.headersFeatureSelector);
  }

  createNewDocument() {
    let rowId = this.getLastRowId() + 1;
    let documentId = this.getLastDocumentId() + 1;
    const emptyDocumentPayload = {
      documentId,
      headers: { ...x.EMPTY_DOCUMENT_HEADER },
      rowId,
      row: { ...x.EMPTY_ROW, id: rowId, logNumber: "1" },
      modifiedCells: [],
      selectedCells: [{ cellId: 2, rowId }],
      modes: { ...x.EMPTY_DOC_MODES },
      docsSettings: null,
      rowPosition: null,
    };
    this._store.dispatch(fromAppActions.addEmptyDocument(emptyDocumentPayload));
    return documentId;
  }

  getDocsSettings() {
    let val: DocsSettingsState;
    this._store
      .select(fromDocsSettingsSelectors.docsSettingsFeatureSelector)
      .pipe(take(1))
      .subscribe((v) => (val = v));
    return val;
  }

  getLastRowId() {
    let lastRowId: number;
    this._store
      .select(fromLatestIdsSelections.selectLatestRowId)
      .pipe(take(1))
      .subscribe((id) => (lastRowId = id));
    return lastRowId;
  }

  getLastDocumentId() {
    let lastDocumentId: number;
    this._store
      .select(fromLatestIdsSelections.selectLatestDocumentId)
      .pipe(take(1))
      .subscribe((id) => (lastDocumentId = id));
    return lastDocumentId;
  }
}
