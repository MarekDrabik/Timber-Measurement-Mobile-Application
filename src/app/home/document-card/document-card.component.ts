import { Component, Input, OnInit } from "@angular/core";
import { AlertPopupService } from "src/app/log-list/shared/alert-popup.service";
import { GlobalStoreService } from "src/app/shared/global-store.service";
import { DocumentId } from "src/app/state/state.types";

@Component({
  selector: "app-document-card",
  templateUrl: "./document-card.component.html",
  styleUrls: ["./document-card.component.scss"],
})
export class DocumentCardComponent {
  @Input() documentInfo: {
    quickName: any;
    createdAt: any;
    documentId: any;
  };

  constructor(private globalStoreService: GlobalStoreService, private popupService: AlertPopupService) {}

  deleteDocument(event: MouseEvent, documentId: DocumentId) {
    event.stopPropagation();
    event.preventDefault();
    this.popupService.deleteDocument(
      () => this.globalStoreService.deleteDocument(documentId),
      () => {}
    );
  }
}
