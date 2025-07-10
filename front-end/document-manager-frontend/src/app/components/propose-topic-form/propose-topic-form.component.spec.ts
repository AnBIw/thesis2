import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProposeTopicFormComponent } from './propose-topic-form.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ThesisService } from '../../services/thesis.service';

describe('ProposeTopicFormComponent', () => {
  let component: ProposeTopicFormComponent;
  let fixture: ComponentFixture<ProposeTopicFormComponent>;
  let mockThesisService: jasmine.SpyObj<ThesisService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('ThesisService', ['addThesisTopic']);

    await TestBed.configureTestingModule({
      imports: [
        ProposeTopicFormComponent,
        MatSnackBarModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: ThesisService, useValue: spy }
      ]
    }).compileComponents();

    mockThesisService = TestBed.inject(ThesisService) as jasmine.SpyObj<ThesisService>;
    fixture = TestBed.createComponent(ProposeTopicFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event when onClose is called', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should validate form correctly', () => {
    expect(component.isFormValid()).toBeFalsy();
    
    component.proposedTopic.title = 'Test Title';
    component.proposedTopic.description = 'Test Description';
    component.proposedTopic.justification = 'Test Justification';
    
    expect(component.isFormValid()).toBeTruthy();
  });
});
