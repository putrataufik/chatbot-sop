import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Subject, forkJoin, takeUntil } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { DocumentService } from '../../core/services/document.service';
import { ChatService } from '../../core/services/chat.service';
import { SopDocument } from '../../core/models/document.model';
import { ChatSession } from '../../core/models/chat.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  user: any = null;
  loading = true;
  documents: SopDocument[] = [];
  sessions: ChatSession[] = [];
  today = new Date();

  private destroy$ = new Subject<void>();

  get docCount(): number { return this.documents.length; }
  get sessionCount(): number { return this.sessions.length; }
  get activeSessions(): number { return this.sessions.filter(s => s.status === 'ACTIVE').length; }

  get activities() {
    const docItems = this.documents.slice(0, 2).map(d => ({
      text: `Dokumen <b>${d.title}</b> tersedia`,
      time: new Date(d.uploaded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      dot: 'blue'
    }));
    const sessionItems = this.sessions.slice(0, 3).map(s => ({
      text: `Sesi chat <b>${s.title}</b>`,
      time: new Date(s.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      dot: s.status === 'ACTIVE' ? 'green' : 'purple'
    }));
    return [...docItems, ...sessionItems].slice(0, 4);
  }

  constructor(
    private auth: AuthService,
    private docService: DocumentService,
    private chatService: ChatService
  ) {
    this.user = this.auth.getCurrentUser();
  }

  ngOnInit() {
    forkJoin({
      documents: this.docService.getAll(),
      sessions: this.chatService.getSessions()
    }).pipe(takeUntil(this.destroy$)).subscribe({
      next: ({ documents, sessions }) => {
        this.documents = documents;
        this.sessions = sessions;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
