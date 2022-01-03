import { Action, createReducer, on } from "@ngrx/store";
import { AutoupdatedFields } from "src/app/shared/types";
import * as fromAppActions from "../app.actions";
import * as fromDocsSettingsActions from "../documentsSettings/docsSettings.actions";
import { DocPrintSettings, DocsSettingsState, DocumentId, LinkedFields } from "../state.types";

const initialState: DocsSettingsState = {};

const reducer = createReducer(
  initialState,
  on(
    fromDocsSettingsActions.setAutoupdatedField,
    (state: DocsSettingsState, props: { documentId: DocumentId; field: keyof AutoupdatedFields; setOn: boolean }) => {
      return {
        ...state,
        [props.documentId]: {
          ...state[props.documentId],
          headerSettings: {
            ...state[props.documentId].headerSettings,
            autoUpdatedFields: {
              ...state[props.documentId].headerSettings.autoUpdatedFields,
              [props.field]: props.setOn,
            },
          },
        },
      };
    }
  ),
  on(
    fromDocsSettingsActions.setLinkedField,
    (state: DocsSettingsState, props: { documentId: DocumentId; field: keyof LinkedFields; setOn: boolean }) => {
      return {
        ...state,
        [props.documentId]: {
          ...state[props.documentId],
          headerSettings: {
            ...state[props.documentId].headerSettings,
            linkedFields: {
              ...state[props.documentId].headerSettings.linkedFields,
              [props.field]: props.setOn,
            },
          },
        },
      };
    }
  ),
  on(fromDocsSettingsActions.setAutoStep, (state: DocsSettingsState, props) => {
    return {
      ...state,
      [props.documentId]: {
        ...state[props.documentId],
        logListSettings: { ...state[props.documentId].logListSettings, autoStep: props.value },
      },
    };
  }),
  on(fromDocsSettingsActions.setActivatedColumns, (state: DocsSettingsState, props) => {
    return {
      ...state,
      [props.documentId]: {
        ...state[props.documentId],
        logListSettings: { ...state[props.documentId].logListSettings, activatedColumns: props.value },
      },
    };
  }),
  on(
    fromDocsSettingsActions.setPrintSettings,
    (state: DocsSettingsState, props: { documentId: DocumentId; settings: Partial<DocPrintSettings> }) => {
      return {
        ...state,
        [props.documentId]: {
          ...state[props.documentId],
          printSettings: {
            ...state[props.documentId].printSettings,
            ...props.settings,
          },
        },
      };
    }
  ),
  on(fromAppActions.addEmptyDocument, (state: DocsSettingsState, props) => {
    return {
      ...state,
      [props.documentId]: {
        documentId: props.documentId,
        createdAt: Date.now(),
        printSettings: {
          logsColumnsCount: 3,
          displayNotes: true,
          displaySumTableDiaDegrees: false,
          displaySummaryTables: true,
        },
        headerSettings: {
          autoUpdatedFields: {
            logTypes: true,
            qualities: true,
            totalVolume: true,
          },
          linkedFields: {
            dateOfTransport: true,
            sellerSigningDate: true,
            buyerSigningDate: true,
          },
        },
        logListSettings: {
          autoStep: true,
          activatedColumns: ["logLength", "logDiameter", "logQuality"],
        },
      },
    };
  }),
  on(fromAppActions.deleteDocument, (state: DocsSettingsState, props) => {
    const newState = {};
    for (let docId in state) {
      if (docId !== props.documentId.toString()) newState[docId] = state[docId];
    }
    return newState;
  }),
  on(fromAppActions.loadState, (state: DocsSettingsState, props) => {
    return props.docsSettings;
  })
);

export function docsSettingsReducer(state: DocsSettingsState | undefined, action: Action) {
  return reducer(state, action);
}
