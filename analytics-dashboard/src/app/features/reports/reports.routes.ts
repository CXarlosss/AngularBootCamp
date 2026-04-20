import { Routes } from '@angular/router';
import { Component } from '@angular/core';

@Component({ standalone: true, template: 'Reports' }) 
export class ReportsComponent {}

export const REPORTS_ROUTES: Routes = [
  { path: '', component: ReportsComponent }
];
