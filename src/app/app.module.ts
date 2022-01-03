import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouteReuseStrategy } from "@angular/router";
import { SocialSharing } from "@ionic-native/social-sharing/ngx";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { Drivers } from "@ionic/storage";
import { IonicStorageModule } from "@ionic/storage-angular";
import { StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import * as CordovaSQLiteDriver from "localforage-cordovasqlitedriver";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { copiedRowsReducer } from "./state/copied-rows/copied-rows.reducer";
import { docsInputMemoriesReducer } from "./state/documentsInputMemories/docs-input-memories.reducer";
import { docsSettingsReducer } from "./state/documentsSettings/docsSettings.reducer";
import { globalSettingsReducer } from "./state/global-settings/global-settings.reducer";
import { headerReducer } from "./state/header/header.reducer";
import { inputMemoryReducer } from "./state/inputMemory/inputMemory.reducer";
import { latestIdsReducer } from "./state/latest-ids/latest-ids.reducer";
import { modesReducer } from "./state/logListModes/modes.reducer";
import { modifiedCellsReducer } from "./state/modifiedCells/modified-cells.reducer";
import { rowsReducer } from "./state/rows/rows.reducer";
import { rowsOrderReducer } from "./state/rowsOrder/rows-order-reducer";
import { selectedCellsReducer } from "./state/selectedCells/selected-cells.reducer";

@NgModule({
  declarations: [AppComponent],
  entryComponents: [],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    StoreModule.forRoot({
      globalSettings: globalSettingsReducer,
      rowsOrder: rowsOrderReducer,
      headers: headerReducer,
      rows: rowsReducer,
      selectedCells: selectedCellsReducer,
      modifiedCells: modifiedCellsReducer,
      inputMemory: inputMemoryReducer,
      docsSettings: docsSettingsReducer,
      docsInputMemories: docsInputMemoriesReducer,
      logListModes: modesReducer,
      copiedRows: copiedRowsReducer,
      latestIds: latestIdsReducer,
    }),
    StoreDevtoolsModule.instrument(),
    IonicStorageModule.forRoot({
      name: "__drevar",
      driverOrder: [CordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage],
    }),
    BrowserAnimationsModule,
    HttpClientModule,
  ],
  providers: [StatusBar, SplashScreen, SocialSharing, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
