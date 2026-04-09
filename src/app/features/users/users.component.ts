import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = false;
  showAddModal = false;
  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN'
  };

  constructor(private userService: UserService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.userService.getAll().subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => this.loading = false
    });
  }

  delete(id: number) {
    if (!confirm('Hapus user ini?')) return;
    this.userService.delete(id).subscribe(() => this.load());
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}