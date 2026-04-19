import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { ChatSession } from '../../../core/models/chat.model';
import { ChatService } from '../../../core/services/chat.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  isAdmin = false;
  user: any = null;
  navItems: any[] = [];
  sessions: ChatSession[] = [];
  activeSessionId: number | null = null;
  sessionSearch = '';

  adminItems = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' },
    { label: 'Dokumen SOP', icon: '📄', route: '/documents' },
    { label: 'Manajemen User', icon: '👥', route: '/users' },
  ];

  get filteredSessions(): ChatSession[] {
    if (!this.sessionSearch.trim()) return this.sessions;
    const q = this.sessionSearch.toLowerCase();
    return this.sessions.filter(s => s.title.toLowerCase().includes(q));
  }

  constructor(
    private auth: AuthService,
    private chatService: ChatService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.auth.getCurrentUser();
    this.isAdmin = this.auth.isAdmin();
    this.navItems = this.isAdmin ? [
      { label: 'Dashboard', icon: '📊', route: '/dashboard' },
      { label: 'Chat SOP', icon: '💬', route: '/chat' },
      { label: 'Dokumen SOP', icon: '📄', route: '/documents' },
    ] : [];
    this.loadSessions();
  }

  loadSessions() {
    this.chatService.getSessions().subscribe({
      next: s => this.sessions = s,
      error: () => this.sessions = []
    });
  }

  onNewChat() {
    this.router.navigate(['/chat'], { queryParams: { new: true } });
  }

  onSelectSession(session: ChatSession) {
    this.activeSessionId = session.id;
    this.router.navigate(['/chat'], { queryParams: { sessionId: session.id } });
  }

  logout() {
    this.auth.logout();
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }
}
