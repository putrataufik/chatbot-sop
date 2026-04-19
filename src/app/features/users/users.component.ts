import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../core/services/user.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit, OnDestroy {
  users: User[] = [];
  loading = false;
  saving = false;
  showModal = false;
  isEditing = false;
  editingId: number | null = null;

  formData = {
    name: '',
    email: '',
    password: '',
    role: 'USER' as 'USER' | 'ADMIN'
  };

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private toast: ToastService
  ) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.userService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: u => { this.users = u; this.loading = false; },
      error: () => this.loading = false
    });
  }

  openAddModal() {
    this.isEditing = false;
    this.editingId = null;
    this.formData = { name: '', email: '', password: '', role: 'USER' };
    this.showModal = true;
  }

  openEditModal(user: User) {
    this.isEditing = true;
    this.editingId = user.id;
    this.formData = { name: user.name, email: user.email, password: '', role: user.role };
    this.showModal = true;
  }

  saveUser() {
    if (!this.formData.name || !this.formData.email) return;
    this.saving = true;

    if (this.isEditing && this.editingId !== null) {
      const payload: any = { name: this.formData.name, role: this.formData.role };
      if (this.formData.password) payload.password = this.formData.password;
      this.userService.update(this.editingId, payload).subscribe({
        next: () => {
          this.toast.success('User berhasil diperbarui');
          this.showModal = false;
          this.saving = false;
          this.load();
        },
        error: () => this.saving = false
      });
    } else {
      this.userService.create(this.formData).subscribe({
        next: () => {
          this.toast.success('User berhasil dibuat');
          this.showModal = false;
          this.saving = false;
          this.load();
        },
        error: () => this.saving = false
      });
    }
  }

  delete(id: number) {
    if (!confirm('Hapus user ini?')) return;
    this.userService.delete(id).subscribe({
      next: () => {
        this.toast.success('User berhasil dihapus');
        this.load();
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
