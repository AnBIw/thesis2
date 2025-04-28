import { Component, OnInit } from '@angular/core';
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
  selector: 'app-professor-panel',
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
  templateUrl: './professor-panel.component.html',
  styleUrls: ['./professor-panel.component.css'],
})
export class ProfessorPanelComponent implements OnInit {
  thesisTopics: ThesisTopic[] = [];
  newTopic: ThesisTopic = {
    id: '',
    title: '',
    professor: '',
    description: '',
    avaliableSlots: 0,
    students: [],
  };

  constructor(private thesisService: ThesisService) {}

  ngOnInit(): void {
    this.loadThesisTopics();
  }

  loadThesisTopics(): void {
    this.thesisService.getThesisTopics().subscribe({
      next: (response) => {
        this.thesisTopics = response;
      },
      error: (error) => {
        console.error('Error loading thesis topics', error);
      },
    });
  }

  addTopic(): void {
    this.thesisService.addThesisTopic(this.newTopic).subscribe({
      next: (response) => {
        this.loadThesisTopics();
        this.newTopic = { id: '', title: '',description: '', professor: '', avaliableSlots: 0, students: [] };
      },
      error: (error) => {
        console.error('Error adding thesis topic', error);
      },
    });
  }

  deleteTopic(id: string): void {
    this.thesisService.deleteThesisTopic(id).subscribe({
      next: () => {
        this.loadThesisTopics();
      },
      error: (error) => {
        console.error('Error deleting thesis topic', error);
      },
    });
  }
}