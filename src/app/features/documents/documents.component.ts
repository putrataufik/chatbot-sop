import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DocumentService } from '../../core/services/document.service';
import { SopDocument } from '../../core/models/document.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: SopDocument[] = [];
  loading = false;
  showUploadModal = false;
  dragOver = false;
  selectedFiles: File[] = [];

  constructor(private docService: DocumentService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.docService.getAll().subscribe({
      next: docs => { this.documents = docs; this.loading = false; },
      error: () => this.loading = false
    });
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.dragOver = false;
    const files = Array.from(e.dataTransfer?.files || []);
    this.selectedFiles = files.filter(f =>
      f.type === 'application/pdf' || f.type === 'text/plain'
    );
  }

  onFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    this.selectedFiles = Array.from(input.files || []);
  }

  upload() {
    if (!this.selectedFiles.length) return;
    this.docService.uploadBulk(this.selectedFiles).subscribe({
      next: () => {
        this.showUploadModal = false;
        this.selectedFiles = [];
        this.load();
      }
    });
  }

  delete(id: number) {
    if (!confirm('Hapus dokumen ini?')) return;
    this.docService.delete(id).subscribe(() => this.load());
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}