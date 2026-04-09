import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  user: any = null;

  stats = [
    { label: 'Dokumen SOP', value: '12', icon: '📄', theme: 'blue', trend: '+2 baru' },
    { label: 'Total Chat', value: '247', icon: '💬', theme: 'purple', trend: '+18 hari ini' },
    { label: 'Akurasi Respons', value: '94%', icon: '🎯', theme: 'green', trend: '↑ 3%' },
    { label: 'Efisiensi Token', value: '62%', icon: '⚡', theme: 'yellow', trend: 'RLM vs Conv.' },
  ];

  activities = [
    { text: 'User <b>Budi Santoso</b> tanya tentang <b>SOP Rekrutmen</b>', time: '2 menit lalu · 312 token (RLM)', dot: 'green' },
    { text: 'Admin upload <b>SOP Penggajian 2026.pdf</b>', time: '14 menit lalu · 2.4 MB', dot: 'blue' },
    { text: 'User <b>Siti Rahayu</b> konsultasi <b>SOP Cuti Melahirkan</b>', time: '1 jam lalu · Akurasi: Sesuai', dot: 'green' },
    { text: 'User baru <b>Andi Firmansyah</b> terdaftar', time: '3 jam lalu', dot: 'purple' },
  ];

  constructor(private auth: AuthService) {
    this.user = this.auth.getCurrentUser();
  }
}