import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { DocumentPageRoutingModule } from "./document-routing.module";
import { DocumentPage } from "./document.page";
import { SettingsPopoverComponent } from "./settings/settings.component";

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule, DocumentPageRoutingModule],
  declarations: [DocumentPage, SettingsPopoverComponent],
})
export class DocumentPageModule {}
