import { createFeatureSelector, createSelector } from "@ngrx/store";
import { AppState, DocsSettingsState } from "../state.types";

export const docsSettingsFeatureSelector = createFeatureSelector<AppState, DocsSettingsState>("docsSettings");

export const selectDocSettings = createSelector(
  docsSettingsFeatureSelector,
  (docsSettings: DocsSettingsState, props: { documentId: number }) => {
    return docsSettings[props.documentId];
  }
);

export const selectAutoStep = createSelector(
  docsSettingsFeatureSelector,
  (docsSettings: DocsSettingsState, props: { documentId: number }) => {
    return docsSettings[props.documentId].logListSettings.autoStep;
  }
);

export const selectActivatedColumns = createSelector(
  docsSettingsFeatureSelector,
  (docsSettings: DocsSettingsState, props: { documentId: number }) => {
    return docsSettings[props.documentId].logListSettings.activatedColumns;
  }
);

export const selectPrintSettings = createSelector(
  docsSettingsFeatureSelector,
  (docsSettings: DocsSettingsState, props: { documentId: number }) => {
    return docsSettings[props.documentId].printSettings;
  }
);

export const selectAutoUpdatedFields = createSelector(
  docsSettingsFeatureSelector,
  (docsSettings: DocsSettingsState, props: { documentId: number }) => {
    return docsSettings[props.documentId].headerSettings.autoUpdatedFields;
  }
);
export const selectLinkedFields = createSelector(
  docsSettingsFeatureSelector,
  (docsSettings: DocsSettingsState, props: { documentId: number }) => {
    return docsSettings[props.documentId].headerSettings.linkedFields;
  }
);
export const selectCreationDate = createSelector(
  docsSettingsFeatureSelector,
  (docsSettings: DocsSettingsState, props: { documentId: number }) => {
    return docsSettings[props.documentId].createdAt;
  }
);
