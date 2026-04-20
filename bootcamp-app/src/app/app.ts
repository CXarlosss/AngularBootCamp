import { Component, inject, signal, OnInit, effect } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Greeting } from './components/greeting/greeting';
import { UserService } from './services/user';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
}
