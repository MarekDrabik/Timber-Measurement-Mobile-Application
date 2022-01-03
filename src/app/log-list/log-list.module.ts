import { ScrollingModule } from "@angular/cdk/scrolling";
import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { LogListRowComponent } from "src/app/log-list/log-list-row/log-list-row.component";
// import { PicovoiceModule } from "../picovoice/picovoice.module";
import { SharedModule } from "../shared/shared.module";
import { SlidingOptionSelectionComponent } from "../shared/sliding-item/sliding-option-selection/sliding-option-selection.component";
import { SlidingOptionComponent } from "../shared/sliding-item/sliding-option/sliding-option.component";
import { SlidingOptionsComponent } from "../shared/sliding-item/sliding-options/sliding-options.component";
import { LogListInputPanelComponent } from "./log-list-footer/log-list-input-panel.component";
import { LogListHeaderComponent } from "./log-list-header/log-list-header.component";
import { LogListInputComponent } from "./log-list-input/log-list-input.component";
import { LogListPageRoutingModule } from "./log-list-routing.module";
import { LogListRowCopyPanelComponent } from "./log-list-row-copy-panel/log-list-row-copy-panel.component";
import { LogListRowSelectionPanelComponent } from "./log-list-row-selection-panel/log-list-row-selection-panel.component";
import { SetMultiNotePopoverComponent } from "./log-list-row-selection-panel/set-multi-note-popover/set-multi-note-popover.component";
import { PropertyColorPipe } from "./log-list-summary/property-color.pipe";
import { SummaryRowComponent } from "./log-list-summary/summary-row/summary-row.component";
import { LogListTableComponent } from "./log-list-table/log-list-table.component";
import { LogListPage } from "./log-list.page";
import { RecommendedValuesComponent } from "./recommended-values/recommended-values.component";
import { RowDuringSummaryComponent } from "./row-during-summary/row-during-summary.component";
import { SvgComponent } from "./svg/svg.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    LogListPageRoutingModule,
    ReactiveFormsModule,
    SharedModule,
    ScrollingModule,
  ],
  declarations: [
    LogListPage,
    LogListHeaderComponent,
    LogListTableComponent,
    LogListRowComponent,
    LogListInputComponent,
    SummaryRowComponent,
    PropertyColorPipe,
    SvgComponent,
    LogListInputPanelComponent,
    RecommendedValuesComponent,
    SlidingOptionComponent,
    SlidingOptionSelectionComponent,
    SlidingOptionsComponent,
    LogListRowSelectionPanelComponent,
    LogListRowCopyPanelComponent,
    RowDuringSummaryComponent,
    SetMultiNotePopoverComponent,
  ],
})
export class LogListPageModule {}
