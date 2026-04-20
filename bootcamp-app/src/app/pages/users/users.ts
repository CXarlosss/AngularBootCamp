import { Component, inject, OnInit } from '@angular/core';
import { Greeting } from '../../components/greeting/greeting';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-users',
  imports: [Greeting],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  private userService = inject(UserService);
  users = this.userService.getUsers();

  ngOnInit() {
    this.userService.loadUsers();
  }
}
