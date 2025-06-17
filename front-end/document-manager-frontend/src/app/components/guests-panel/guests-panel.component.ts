import { Component } from '@angular/core';
import { DocumentListComponent } from '../document-list/document-list.component';
import { TopicListComponent } from '../topic-list/topic-list.component';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCard } from '@angular/material/card';

@Component({
  selector: 'app-guests-panel',
  imports: [
    DocumentListComponent,    // Importa el subcomponente de la lista
    TopicListComponent,
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
