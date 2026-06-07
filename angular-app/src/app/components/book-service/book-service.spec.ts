import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookService } from './book-service';

describe('BookService', () => {
  let component: BookService;
  let fixture: ComponentFixture<BookService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookService],
    }).compileComponents();

    fixture = TestBed.createComponent(BookService);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
