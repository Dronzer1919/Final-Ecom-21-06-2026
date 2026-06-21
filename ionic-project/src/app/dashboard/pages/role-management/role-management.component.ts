import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { AccessUser, CreateUserPayload, UserAccessService } from '../../../services/user-access.service';

@Component({
  selector: 'app-role-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterModule],
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.scss']
})
export class RoleManagementComponent implements OnInit {
  users: AccessUser[] = [];
  filteredUsers: AccessUser[] = [];
  searchQuery  = '';
  activeRole   = '';
  isLoading    = false;
  loadError    = '';

  deleteConfirmId: string | null = null;

  // Add-user form
  showAddForm  = false;
  isAdding     = false;
  addError     = '';
  newUser: CreateUserPayload = { firstName: '', lastName: '', email: '', role: 'enduser', password: '', phone: '' };

  stats = { totalUsers: 0, activeUsers: 0, totalPermissions: 0 };

  constructor(private accessService: UserAccessService) {}

  ngOnInit(): void {
    this.stats.totalPermissions = this.accessService.getTotalCtaCount();
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.loadError = '';
    this.accessService.fetchUsers(this.searchQuery || undefined).subscribe({
      next: users => {
        this.users = users;
        this.stats.totalUsers  = users.length;
        this.stats.activeUsers = users.filter(u => u.isActive).length;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.loadError = 'Could not load users from server.';
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchQuery = (event.target as HTMLInputElement).value.toLowerCase();
    this.applyFilters();
  }

  filterByRole(role: string): void {
    this.activeRole = role;
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredUsers = this.users.filter(u => {
      const matchSearch = !this.searchQuery ||
        u.fullName.toLowerCase().includes(this.searchQuery) ||
        u.email.toLowerCase().includes(this.searchQuery);
      const matchRole = !this.activeRole || u.role === this.activeRole;
      return matchSearch && matchRole;
    });
  }

  /* ── Add User ── */
  openAddForm(): void {
    this.newUser   = { firstName: '', lastName: '', email: '', role: 'enduser', password: '', phone: '' };
    this.addError  = '';
    this.showAddForm = true;
  }

  cancelAddForm(): void {
    this.showAddForm = false;
    this.addError    = '';
  }

  submitAddUser(): void {
    if (!this.newUser.firstName.trim() || !this.newUser.email.trim() || !this.newUser.password.trim()) {
      this.addError = 'Name, email and password are required.';
      return;
    }
    this.isAdding = true;
    this.addError = '';
    this.accessService.createUser(this.newUser).subscribe({
      next: user => {
        this.users = [...this.users, user];
        this.stats.totalUsers  = this.users.length;
        this.stats.activeUsers = this.users.filter(u => u.isActive).length;
        this.applyFilters();
        this.isAdding    = false;
        this.showAddForm = false;
      },
      error: (err) => {
        this.addError = err?.error?.message ?? 'Failed to add user.';
        this.isAdding = false;
      }
    });
  }

  /* ── Status toggle ── */
  toggleStatus(user: AccessUser): void {
    this.accessService.toggleUserStatus(user.id).subscribe(() => {
      this.users = this.accessService.users;
      this.stats.activeUsers = this.users.filter(u => u.isActive).length;
      this.applyFilters();
    });
  }

  /* ── Delete ── */
  confirmDelete(id: string): void  { this.deleteConfirmId = id; }
  cancelDelete():  void             { this.deleteConfirmId = null; }

  executeDelete(id: string): void {
    this.accessService.deleteUser(id).subscribe(() => {
      this.deleteConfirmId = null;
      this.users = this.accessService.users;
      this.stats.totalUsers  = this.users.length;
      this.stats.activeUsers = this.users.filter(u => u.isActive).length;
      this.applyFilters();
    });
  }

  /* ── Helpers ── */
  getInitials(name: string): string {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'];
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % colors.length;
    return colors[Math.abs(hash)];
  }

  getRoleBadgeClass(role: string): string { return `role-badge role-${role}`; }

  getPermStats(userId: string) { return this.accessService.getPermissionStats(userId); }

  formatDate(dateStr?: string): string {
    if (!dateStr) return 'Never';
    const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    return `${diff} days ago`;
  }
}
