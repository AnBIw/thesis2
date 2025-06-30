import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ThesisService } from '../../services/thesis.service';
import { ThesisTopic } from '../../models/thesis-topic.model';

@Component({
  selector: 'add-topic-form',
  standalone: true, // Asegúrate de que sea standalone
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
  ],
  templateUrl: './add-topic-form.component.html',
  styleUrls: ['./add-topic-form.component.css'],
})
export class AddTopicFormComponent {
  isMinimized = false;

  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
  }
  professorName: string = localStorage.getItem('name') || ''; 
  thesisTopics: ThesisTopic[] = [];
  newTopic: ThesisTopic = {
    id: '',
    title: '',
    description: '',
    avaliableSlots: 0,
    enrolledStudents: [],
    professor: localStorage.getItem('name') || '',
  };
  constructor(private thesisService: ThesisService) { }

  ngOnInit(): void {
  }

  addTopic(): void {
    this.thesisService.addThesisTopic(this.newTopic).subscribe({
      next: (response) => {
        this.newTopic = {
          id: '',
          title: '',
          description: '',
          professor: localStorage.getItem('name') || '',
          avaliableSlots: 0,
          enrolledStudents: []
        };
        console.log('Thesis topic added successfully', response);
      },
      error: (error) => {
        console.error('Error adding thesis topic', error);
      },
    });
  }
}