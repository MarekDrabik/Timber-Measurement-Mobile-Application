import { createAction, props } from "@ngrx/store";
import { AutoupdatedFields, ColumnPropertyValue } from "src/app/shared/types";
import { DocumentId, DocPrintSettings, LinkedFields } from "../state.types";

export const setAutoStep = createAction(
  "[DocumentsSettings] Set AutoStep",
  props<{ documentId: DocumentId; value: boolean }>()
);

export const setActivatedColumns = createAction(
  "[DocumentsSettings] Set ActivatedColumns",
  props<{ documentId: DocumentId; value: (keyof ColumnPropertyValue)[] }>()
);

export const setPrintSettings = createAction(
  "[DocumentsSettings] Set Print Settings",
  props<{ documentId: DocumentId; settings: Partial<DocPrintSettings> }>()
);

export const setAutoupdatedField = createAction(
  "[DocumentsSettings] Set Autoupdated Field",
  props<{ documentId: DocumentId; field: keyof AutoupdatedFields; setOn: boolean }>()
);
export const setLinkedField = createAction(
  "[DocumentsSettings] Set Linked Field",
  props<{ documentId: DocumentId; field: keyof LinkedFields; setOn: boolean }>()
);
