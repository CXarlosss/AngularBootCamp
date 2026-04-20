import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Carritos } from './carritos';

describe('Carritos', () => {
  let component: Carritos;
  let fixture: ComponentFixture<Carritos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Carritos],
    }).compileComponents();

    fixture = TestBed.createComponent(Carritos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
