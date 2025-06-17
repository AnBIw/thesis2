import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestsPanelComponent } from './guests-panel.component';

describe('GuestsPanelComponent', () => {
  let component: GuestsPanelComponent;
  let fixture: ComponentFixture<GuestsPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GuestsPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestsPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
