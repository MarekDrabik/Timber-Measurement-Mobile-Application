import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LogListPage } from './log-list.page';

const routes: Routes = [
  {
    path: '',
    component: LogListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LogListPageRoutingModule {}
