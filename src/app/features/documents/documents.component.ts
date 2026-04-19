import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DocumentService } from '../../core/services/document.service';
import { ToastService } from '../../core/services/toast.service';
import { SopDocument } from '../../core/models/document.model';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './documents.component.html',
  styleUrls: ['./documents.component.css']
})
export class DocumentsComponent implements OnInit {
  documents: SopDocument[] = [];
  loading = false;
  uploading = false;
  showUploadModal = false;
  dragOver = false;
  selectedFiles: File[] = [];
  searchQuery = '';

  get filteredDocuments(): SopDocument[] {
    if (!this.searchQuery.trim()) return this.documents;
    const q = this.searchQuery.toLowerCase();
    return this.documents.filter(d => d.title.toLowerCase().includes(q));
  }

  constructor(
    private docService: DocumentService,
    private toast: ToastService
  ) {}

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
    this.uploading = true;
    this.docService.uploadBulk(this.selectedFiles).subscribe({
      next: (res) => {
        this.uploading = false;
        this.showUploadModal = false;
        this.selectedFiles = [];
        const successCount = res.success?.length ?? 0;
        const failedCount = res.failed?.length ?? 0;
        if (failedCount > 0) {
          this.toast.info(`${successCount} dokumen berhasil, ${failedCount} gagal diupload`);
        } else {
          this.toast.success(`${successCount} dokumen berhasil diupload`);
        }
        this.load();
      },
      error: () => { this.uploading = false; }
    });
  }

  delete(id: number) {
    if (!confirm('Hapus dokumen ini?')) return;
    this.docService.delete(id).subscribe({
      next: () => {
        this.toast.success('Dokumen berhasil dihapus');
        this.load();
      }
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
