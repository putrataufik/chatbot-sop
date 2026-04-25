import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  AfterViewChecked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import {
  ChatSession,
  Message,
  SubQueryResult,
  TokenUsageLog,
} from '../../core/models/chat.model';
import { MarkdownComponent } from 'ngx-markdown';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, MarkdownComponent],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
})
export class ChatComponent implements OnInit, AfterViewChecked {
  @ViewChild('messagesEl') messagesEl!: ElementRef;

  sessions: ChatSession[] = [];
  activeSession: ChatSession | null = null;
  messages: Message[] = [];
  inputText = '';
  isTyping = false;
  showRlmPanel = false;
  selectedSubQueries: SubQueryResult[] = [];
  selectedTokenUsage: TokenUsageLog | null = null;
  user: any = null;

  private shouldScroll = false;

  constructor(
    private chatService: ChatService,
    private auth: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.user = this.auth.getCurrentUser();
  }

  ngOnInit() {
    this.loadSessions();
    this.route.queryParams.subscribe((params) => {
      if (params['new']) {
        this.activeSession = null;
        this.messages = [];
        this.showRlmPanel = false;
      } else if (params['sessionId']) {
        const id = +params['sessionId'];
        this.chatService.getSessions().subscribe({
          next: (sessions) => {
            this.sessions = sessions;
            const found = sessions.find((s) => s.id === id);
            if (found) {
              this.activeSession = found;
              this.loadMessages(id);
            }
          },
        });
      }
    });
  }

  ngAfterViewChecked() {
    if (this.shouldScroll) {
      this.doScroll();
      this.shouldScroll = false;
    }
  }

  loadSessions() {
    this.chatService.getSessions().subscribe({
      next: (s) => (this.sessions = s),
      error: () => (this.sessions = []),
    });
  }

  loadMessages(sessionId: number) {
    this.messages = [];
    this.chatService.getMessages(sessionId).subscribe({
      next: (m) => {
        this.messages = m;
        this.shouldScroll = true;
      },
      error: () => (this.messages = []),
    });
  }

  startNewSession() {
    this.chatService.createSession('...').subscribe({
      next: (s) => {
        this.sessions.unshift(s);
        this.activeSession = s;
        this.messages = [];
        this.showRlmPanel = false;
        this.router.navigate([], {
          queryParams: { sessionId: s.id },
          replaceUrl: true,
        });
      },
    });
  }

  sendMessage() {
  if (!this.inputText.trim() || !this.activeSession || this.isTyping) return;
  const content = this.inputText.trim();
  const isFirstMessage = this.messages.length === 0;
  this.inputText = '';
  this.isTyping = true;

  const userMsg: Message = {
    id: Date.now(),
    session_id: this.activeSession.id,
    role: 'USER',
    content,
    timestamp: new Date().toISOString()
  };
  this.messages.push(userMsg);
  this.shouldScroll = true;

  this.chatService.sendMessage(this.activeSession.id, content).subscribe({
    next: (res: any) => {
      this.isTyping = false;

      const assistant = res.assistantMessage;

      const botMsg: Message = {
        id: assistant.id,
        session_id: this.activeSession!.id,
        role: 'ASST',
        content: assistant.content,
        input_tokens: res.tokenUsage?.input_tokens ?? assistant.input_tokens ?? 0,
        output_tokens: res.tokenUsage?.output_tokens ?? assistant.output_tokens ?? 0,
        timestamp: assistant.timestamp ?? new Date().toISOString()
      };

      this.messages.push(botMsg);
      this.shouldScroll = true;

      if (isFirstMessage) {
        this.chatService.getSessions().subscribe({
          next: sessions => {
            this.sessions = sessions;
            const updated = sessions.find(s => s.id === this.activeSession!.id);
            if (updated) this.activeSession = updated;
          }
        });
      }
    },
    error: (err) => {
      console.error('SEND ERROR:', err);
      this.isTyping = false;
      this.messages.push({
        id: Date.now() + 1,
        session_id: this.activeSession!.id,
        role: 'ASST',
        content: 'Terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date().toISOString()
      });
      this.shouldScroll = true;
    }
  });
}

  showRlm(msg: Message) {
    this.showRlmPanel = true;
    this.selectedSubQueries = [];
    this.selectedTokenUsage = null;
    this.chatService.getSubQueries(msg.id).subscribe({
      next: (sq) => (this.selectedSubQueries = sq),
      error: () => (this.selectedSubQueries = []),
    });
    this.chatService.getTokenUsage(msg.id).subscribe({
      next: (tu) => (this.selectedTokenUsage = tu),
      error: () => (this.selectedTokenUsage = null),
    });
  }

  onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  private doScroll() {
    if (this.messagesEl) {
      this.messagesEl.nativeElement.scrollTop =
        this.messagesEl.nativeElement.scrollHeight;
    }
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  }

  formatTime(ts: string): string {
    if (!ts) return '';
    const date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  calcSaving(tu: TokenUsageLog): number {
    const total = tu.input_tokens + tu.output_tokens;
    return Math.max(0, Math.round((1 - total / 1840) * 100));
  }
}
