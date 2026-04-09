import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { AuthService } from '../../core/services/auth.service';
import { ChatSession, Message, SubQueryResult, TokenUsageLog } from '../../core/models/chat.model';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  @ViewChild('messagesEl') messagesEl!: ElementRef;

  sessions: ChatSession[] = [];
  activeSession: ChatSession | null = null;
  messages: Message[] = [];
  inputText = '';
  isTyping = false;
  showRlmPanel = false;
  showNewSessionModal = false;
  newSessionTitle = '';
  selectedSubQueries: SubQueryResult[] = [];
  selectedTokenUsage: TokenUsageLog | null = null;
  user: any = null;

  constructor(
    private chatService: ChatService,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {
    this.user = this.auth.getCurrentUser();
  }

  ngOnInit() {
    this.loadSessions();
    this.route.queryParams.subscribe(params => {
      if (params['new']) {
        this.activeSession = null;
        this.messages = [];
        this.showRlmPanel = false;
      } else if (params['sessionId']) {
        const id = +params['sessionId'];
        this.chatService.getSessions().subscribe({
          next: sessions => {
            this.sessions = sessions;
            const found = sessions.find(s => s.id === id);
            if (found) {
              this.activeSession = found;
              this.loadMessages(id);
            }
          }
        });
      }
    });
  }

  loadSessions() {
    this.chatService.getSessions().subscribe({
      next: s => this.sessions = s,
      error: () => this.sessions = []
    });
  }

  loadMessages(sessionId: number) {
    this.messages = [];
    this.chatService.getMessages(sessionId).subscribe({
      next: m => { this.messages = m; this.scrollToBottom(); },
      error: () => this.messages = []
    });
  }

  selectSession(session: ChatSession) {
    this.activeSession = session;
    this.showRlmPanel = false;
    this.loadMessages(session.id);
  }

  createSession() {
    if (!this.newSessionTitle.trim()) return;
    this.chatService.createSession(this.newSessionTitle).subscribe({
      next: s => {
        this.sessions.unshift(s);
        this.activeSession = s;
        this.messages = [];
        this.showNewSessionModal = false;
        this.newSessionTitle = '';
      }
    });
  }

  sendMessage() {
    if (!this.inputText.trim() || !this.activeSession || this.isTyping) return;
    const content = this.inputText.trim();
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
    this.scrollToBottom();

    this.chatService.sendMessage(this.activeSession.id, content).subscribe({
      next: msg => {
        this.isTyping = false;
        this.messages.push(msg);
        this.scrollToBottom();
      },
      error: () => this.isTyping = false
    });
  }

  showRlm(msg: Message) {
    this.showRlmPanel = true;
    this.selectedSubQueries = [];
    this.selectedTokenUsage = null;
    this.chatService.getSubQueries(msg.id).subscribe({
      next: sq => this.selectedSubQueries = sq,
      error: () => this.selectedSubQueries = []
    });
    this.chatService.getTokenUsage(msg.id).subscribe({
      next: tu => this.selectedTokenUsage = tu,
      error: () => this.selectedTokenUsage = null
    });
  }

  onEnter(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      if (this.messagesEl)
        this.messagesEl.nativeElement.scrollTop = this.messagesEl.nativeElement.scrollHeight;
    }, 50);
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();
  }

  formatTime(ts: string): string {
    if (!ts) return '';
    const date = new Date(ts);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  }

  calcSaving(tu: TokenUsageLog): number {
    const total = tu.input_tokens + tu.output_tokens;
    return Math.max(0, Math.round((1 - total / 1840) * 100));
  }
}