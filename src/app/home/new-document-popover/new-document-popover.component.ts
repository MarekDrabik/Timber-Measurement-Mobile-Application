import { Component, Input, ViewChild } from "@angular/core";
import { FormControl } from "@angular/forms";
import { IonInput } from "@ionic/angular";
import { Subscription } from "rxjs";

@Component({
  selector: "app-new-document-popover",
  templateUrl: "./new-document-popover.component.html",
  styleUrls: ["./new-document-popover.component.scss"],
})
export class NewDocumentPopoverComponent {
  @Input() onQuicknameChange: (quickname: string) => void;
  @Input() onCancelPopover: () => void;
  @Input() onDismiss: () => void;

  @ViewChild("inputRef", { read: IonInput, static: true }) ionInput: IonInput;

  quicknameControl = new FormControl("");
  private sub: Subscription;

  constructor() {
    this.sub = this.quicknameControl.valueChanges.subscribe({
      next: (v) => {
        this.onQuicknameChange(v);
      },
    });
  }

  ionViewDidEnter() {
    this.setFocusOnInput();
  }

  setFocusOnInput() {
    setTimeout((_) => {
      this.ionInput.setFocus();
    }, 0);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
