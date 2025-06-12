import { Component, EventEmitter, Output } from '@angular/core';
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
import { LoginComponent } from '../login/login.component';

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
  //@Output() topicAdded = new EventEmitter<void>(); // Evento para notificar que se agregó un tema
  thesisTopics: ThesisTopic[] = [];
  newTopic: ThesisTopic = {
    id: '',
    title: '',
    description: '',
    avaliableSlots: 0,
    enrolledStudents: [],
    professor: localStorage.getItem('name') || '', // Obtiene el nombre del profesor desde el localStorage
  };
  constructor(private thesisService: ThesisService) {}

  ngOnInit(): void {
    //console.log(this.thesisTopics);
  }

  addTopic(): void {
    this.thesisService.addThesisTopic(this.newTopic).subscribe({
      next: (response) => {
        this.newTopic = { 
          id: '', 
          title: '',
          description: '', 
          professor: localStorage.getItem('name') || '', // Obtén el nombre del profesor desde el localStorage
          avaliableSlots: 0, 
          enrolledStudents	: [] 
        };
      console.log('Thesis topic added successfully', response);
      },
      error: (error) => {
        console.error('Error adding thesis topic', error);
      },
    });
  }

  // deleteTopic(id: string): void {
  //   this.thesisService.deleteThesisTopic(id).subscribe({
  //     next: () => {
  //       //this.loadThesisTopics();
  //     },
  //     error: (error) => {
  //       console.error('Error deleting thesis topic', error);
  //     },
  //   });
  // }
}