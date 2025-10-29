import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PollListComponent } from './poll-list';

describe('PollListComponent', () => {
  let component: PollListComponent;
  let fixture: ComponentFixture<PollListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, PollListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PollListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('validation', () => {
    beforeEach(() => {
      // mock localStorage to avoid persisting state between tests
      const store: Record<string, string> = {};
      spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] ?? null);
      spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => (store[key] = value));
      spyOn(localStorage, 'removeItem').and.callFake((key: string) => delete store[key]);
      spyOn(localStorage, 'clear').and.callFake(() => {
        Object.keys(store).forEach(k => delete store[k]);
      });
    });

    it('rejects duplicate options (case-insensitive)', () => {
      component.newQuestion = 'Test question';
      component.newOptions = ['Yes', 'yes'];
      expect(component.hasDuplicateOptions()).toBeTrue();
      expect(component.canSubmit()).toBeFalse();
    });

    it('accepts valid distinct options', () => {
      component.newQuestion = 'Another?';
      component.newOptions = ['Alpha', 'Beta', ' Gamma '];
      expect(component.hasDuplicateOptions()).toBeFalse();
      expect(component.canSubmit()).toBeTrue();
    });
  });
});
