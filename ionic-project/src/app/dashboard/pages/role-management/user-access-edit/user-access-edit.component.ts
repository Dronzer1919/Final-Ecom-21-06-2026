import { Component, OnInit, Directive, ElementRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  AccessUser,
  PermissionSection,
  PermissionPage,
  PermissionCta,
  UserAccessService
} from '../../../../services/user-access.service';

@Directive({ selector: '[appIndeterminate]', standalone: true })
export class IndeterminateDirective {
  @Input('appIndeterminate') set indeterminate(val: boolean | undefined) {
    this.el.nativeElement.indeterminate = !!val;
  }
  constructor(private el: ElementRef<HTMLInputElement>) {}
}

@Component({
  selector: 'app-user-access-edit',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterModule, IndeterminateDirective],
  templateUrl: './user-access-edit.component.html',
  styleUrls: ['./user-access-edit.component.scss']
})
export class UserAccessEditComponent implements OnInit {
  user: AccessUser | undefined;
  permissionTree: PermissionSection[] = [];
  isSaving = false;
  saveSuccess = false;

  // Clone dropdown state
  cloneOpen     = false;
  cloneUserId   = '';
  otherUsers: AccessUser[] = [];

  // Delete / status
  deleteConfirm   = false;

  // Role change
  isChangingRole  = false;
  roleChangeError = '';

  readonly availableRoles: { value: AccessUser['role']; label: string; icon: string; desc: string }[] = [
    { value: 'superadmin', label: 'Superadmin', icon: '👑', desc: 'Full access' },
    { value: 'admin',      label: 'Admin',      icon: '🛡️', desc: 'B2B Management' },
    { value: 'vendor',     label: 'Vendor',     icon: '🏪', desc: 'B2B Management' },
    { value: 'enduser',    label: 'End User',   icon: '👤', desc: 'Orders only' },
  ];

  readonly roleTemplates: { role: AccessUser['role']; label: string; desc: string; icon: string }[] = [
    { role: 'superadmin', label: 'Superadmin', desc: 'All permissions',    icon: '👑' },
    { role: 'admin',      label: 'Admin',      desc: 'B2B Management',     icon: '🔵' },
    { role: 'vendor',     label: 'Vendor',     desc: 'B2B Management',     icon: '🟢' },
    { role: 'enduser',    label: 'End User',   desc: 'Dashboard & Orders', icon: '👤' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accessService: UserAccessService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    const fromCache = this.accessService.getUserById(id);
    if (fromCache) {
      this.initWithUser(fromCache, id);
    } else {
      // Cache miss — fetch all users first (e.g. direct URL navigation)
      this.accessService.fetchUsers().subscribe(() => {
        const user = this.accessService.getUserById(id);
        if (user) {
          this.initWithUser(user, id);
        } else {
          this.router.navigate(['/dashboard/role-management']);
        }
      });
    }
  }

  private initWithUser(user: AccessUser, id: string): void {
    this.user = user;
    this.permissionTree = this.accessService.getPermissionTree();
    const saved = this.accessService.getUserPermissions(id);
    if (Object.keys(saved).length > 0) {
      this.accessService.applyPermissionsToTree(this.permissionTree, saved);
    }

    // Refresh from backend so UI mirrors server state when available.
    this.accessService.fetchUserPermissions(id).subscribe(perms => {
      this.permissionTree = this.accessService.getPermissionTree();
      this.accessService.applyPermissionsToTree(this.permissionTree, perms);
    });

    this.otherUsers = this.accessService.users.filter(u => u.id !== id);
  }

  /* ── Status & Delete ── */

  /* ── Role change ── */
  changeRole(newRole: AccessUser['role']): void {
    if (!this.user || newRole === this.user.role || this.isChangingRole) return;
    this.isChangingRole  = true;
    this.roleChangeError = '';
    this.accessService.changeUserRole(this.user.id, newRole).subscribe({
      next: () => {
        this.user        = { ...this.user!, role: newRole };
        this.isChangingRole = false;
      },
      error: () => {
        this.roleChangeError = 'Failed to update role. Try again.';
        this.isChangingRole  = false;
      }
    });
  }

  toggleStatus(): void {
    if (!this.user) return;
    this.accessService.toggleUserStatus(this.user.id).subscribe(next => {
      this.user = { ...this.user!, isActive: next };
    });
  }

  requestDelete(): void { this.deleteConfirm = true; }
  cancelDelete():  void { this.deleteConfirm = false; }

  executeDelete(): void {
    if (!this.user) return;
    this.accessService.deleteUser(this.user.id).subscribe(() => {
      this.router.navigate(['/dashboard/role-management']);
    });
  }

  /* ── Clone / Template ── */

  toggleClone(): void {
    this.cloneOpen = !this.cloneOpen;
    if (!this.cloneOpen) this.cloneUserId = '';
  }

  closeClone(): void {
    this.cloneOpen = false;
    this.cloneUserId = '';
  }

  applyTemplate(role: AccessUser['role']): void {
    this.revokeAll();
    if (role === 'superadmin') {
      this.grantAll();
    } else if (role === 'admin' || role === 'vendor') {
      const b2b = this.permissionTree.find(s => s.id === 'b2b-management');
      if (b2b) this.grantSection(b2b);
    } else if (role === 'enduser') {
      const orders = this.permissionTree.find(s => s.id === 'orders');
      if (orders) this.grantSection(orders);
    }
    this.cloneOpen = false;
  }

  onCloneUserChange(event: Event): void {
    this.cloneUserId = (event.target as HTMLSelectElement).value;
  }

  applyCloneFromUser(): void {
    if (!this.cloneUserId) return;
    const perms = this.accessService.getUserPermissions(this.cloneUserId);
    this.permissionTree = this.accessService.getPermissionTree();
    this.accessService.applyPermissionsToTree(this.permissionTree, perms);
    this.cloneOpen = false;
    this.cloneUserId = '';
  }

  getCloneUserName(): string {
    return this.otherUsers.find(u => u.id === this.cloneUserId)?.fullName ?? '';
  }

  /* ── Section / Page / CTA toggles ── */

  onSectionToggle(section: PermissionSection, checked: boolean): void {
    section.checked = checked;
    section.indeterminate = false;
    section.pages.forEach(page => {
      page.checked = checked;
      page.indeterminate = false;
      page.ctas.forEach(c => (c.checked = checked));
    });
  }

  onPageToggle(section: PermissionSection, page: PermissionPage, checked: boolean): void {
    page.checked = checked;
    page.indeterminate = false;
    page.ctas.forEach(c => (c.checked = checked));
    this.recalcSection(section);
  }

  onCtaToggle(section: PermissionSection, page: PermissionPage, ctaIndex: number, checked: boolean): void {
    page.ctas[ctaIndex].checked = checked;
    this.recalcPage(page);
    this.recalcSection(section);
  }

  toggleSectionExpand(section: PermissionSection): void { section.expanded = !section.expanded; }
  togglePageExpand(page: PermissionPage): void         { page.expanded = !page.expanded; }

  grantAll(): void {
    this.permissionTree.forEach(section => {
      section.checked = true; section.indeterminate = false;
      section.pages.forEach(page => {
        page.checked = true; page.indeterminate = false;
        page.ctas.forEach(c => (c.checked = true));
      });
    });
  }

  revokeAll(): void {
    this.permissionTree.forEach(section => {
      section.checked = false; section.indeterminate = false;
      section.pages.forEach(page => {
        page.checked = false; page.indeterminate = false;
        page.ctas.forEach(c => (c.checked = false));
      });
    });
  }

  save(): void {
    if (!this.user) return;
    this.isSaving = true;
    setTimeout(() => {
      this.accessService.saveUserPermissionsRemote(this.user!.id, this.permissionTree).subscribe(() => {
        // Keep local cache in sync regardless of API path.
        this.accessService.saveUserPermissions(this.user!.id, this.permissionTree);

        this.isSaving = false;
        this.saveSuccess = true;
        setTimeout(() => (this.saveSuccess = false), 3000);
      });
    }, 400);
  }

  /* ── Helpers ── */

  getSectionGranted(section: PermissionSection): number {
    return section.pages.reduce((a, p) => a + p.ctas.filter(c => c.checked).length, 0);
  }

  getSectionTotal(section: PermissionSection): number {
    return section.pages.reduce((a, p) => a + p.ctas.length, 0);
  }

  getPageGranted(page: PermissionPage): number { return page.ctas.filter(c => c.checked).length; }

  getCtas(page: PermissionPage, type: PermissionCta['type']): { cta: PermissionCta; index: number }[] {
    return page.ctas.map((cta, index) => ({ cta, index })).filter(item => item.cta.type === type);
  }

  trackByCta(_: number, item: { cta: PermissionCta; index: number }): string { return item.cta.id; }

  getInitials(name: string): string {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
  }

  getAvatarColor(name: string): string {
    const colors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#f97316'];
    let hash = 0;
    for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % colors.length;
    return colors[Math.abs(hash)];
  }

  getTotalGranted(): number {
    let c = 0;
    this.permissionTree.forEach(s => s.pages.forEach(p => { c += p.ctas.filter(x => x.checked).length; }));
    return c;
  }

  getTotalCount(): number {
    let c = 0;
    this.permissionTree.forEach(s => s.pages.forEach(p => { c += p.ctas.length; }));
    return c;
  }

  private grantSection(section: PermissionSection): void {
    section.checked = true;
    section.indeterminate = false;
    section.expanded = true;
    section.pages.forEach(page => {
      page.checked = true;
      page.indeterminate = false;
      page.ctas.forEach(c => (c.checked = true));
    });
  }

  private recalcPage(page: PermissionPage): void {
    const n = page.ctas.length;
    const c = page.ctas.filter(x => x.checked).length;
    page.checked = n > 0 && c === n;
    page.indeterminate = c > 0 && c < n;
  }

  private recalcSection(section: PermissionSection): void {
    const n = section.pages.length;
    const fully = section.pages.filter(p => p.checked && !p.indeterminate).length;
    const any   = section.pages.filter(p => p.checked || p.indeterminate).length;
    section.checked = fully === n && n > 0;
    section.indeterminate = any > 0 && fully < n;
  }
}
