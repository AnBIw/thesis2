import { Component } from '@angular/core';
import { DocumentListComponent } from '../document-list/document-list.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-guests-panel',
  imports: [
    DocumentListComponent,
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
  ],
  templateUrl: './guests-panel.component.html',
  styleUrls: ['./guests-panel.component.css']
})
export class GuestsPanelComponent {

}
