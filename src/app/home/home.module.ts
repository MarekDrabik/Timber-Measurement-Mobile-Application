import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { SharedModule } from "../shared/shared.module";
import { DocumentCardComponent } from "./document-card/document-card.component";
import { HomePageRoutingModule } from "./home-routing.module";
import { HomePage } from "./home.page";
import { NewDocumentPopoverComponent } from "./new-document-popover/new-document-popover.component";

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, HomePageRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [HomePage, DocumentCardComponent, NewDocumentPopoverComponent],
})
export class HomePageModule {}
