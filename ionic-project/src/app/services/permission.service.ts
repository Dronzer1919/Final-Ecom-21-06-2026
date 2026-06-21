import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, of } from 'rxjs';
import { catchError, finalize, map } from 'rxjs/operators';
import { AuthService } from '../auth/services/auth.service';
import { UserAccessService } from './user-access.service';
import { environment } from '../../environments/environment';
import { User } from '../auth/interfaces/auth.interface';

interface PermissionsApiResponse {
  success: boolean;
  data:
    | { [key: string]: boolean }
    | {
        permissions: { [key: string]: boolean };
        sections?: SidebarSectionMeta[];
      };
}

interface SidebarSectionMeta {
  id: string;
  title: string;
  subtitle?: string;
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  readonly permissions$ = new BehaviorSubject<{ [key: string]: boolean }>({});
  readonly sidebarSections$ = new BehaviorSubject<{ [id: string]: { title: string; subtitle?: string } }>({});
  readonly isAdminUser$ = new BehaviorSubject<boolean>(false);
  readonly isLoaded$ = new BehaviorSubject<boolean>(false);

  private readonly ADMIN_ROLES = ['admin', 'manager', 'superadmin'];
  private lastHandledUserId = '';
  private loadingUserId = '';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userAccessService: UserAccessService
  ) {
    // BehaviorSubject fires synchronously on subscription (current value) and on every
    // subsequent login/logout — no dependency on Angular's effect/CD scheduler.
    authService.currentUser$.subscribe(user => this.handleUser(user));
  }

  private handleUser(user: User | null): void {
    if (!user) {
      this.lastHandledUserId = '';
      this.isAdminUser$.next(false);
      this.permissions$.next({});
      this.sidebarSections$.next({});
      this.isLoaded$.next(false);
      return;
    }

    const userId: string = (user as any).id ?? (user as any)._id ?? '';
    const role: string = ((user as any).role ?? '').toLowerCase();
    const isAdmin = this.ADMIN_ROLES.includes(role);

    // Prevent duplicate calls for the same user when already loaded/in-flight
    if (userId && userId === this.loadingUserId) return;
    if (userId && userId === this.lastHandledUserId && this.isLoaded$.getValue()) return;
    this.lastHandledUserId = userId;

    this.isAdminUser$.next(isAdmin);

    if (userId) {
      // Always fetch from backend — admin, manager, staff, everyone.
      // The sidebar still uses isAdminUser$ to show everything for admins,
      // but the API call always fires so the backend can log / enforce access.
      this.fetchPermissions(userId);
    } else {
      this.permissions$.next({});
      this.sidebarSections$.next({});
      this.isLoaded$.next(true);
    }
  }

  private fetchPermissions(userId: string): void {
    this.loadingUserId = userId;
    this.isLoaded$.next(false);
    this.http
      .get<PermissionsApiResponse>(`${environment.apiUrl}/users/${userId}/permissions?includeStructure=true`)
      .pipe(
        map(res => {
          const rawData = res?.data ?? {};
          const hasCombinedShape =
            typeof rawData === 'object' &&
            rawData !== null &&
            Object.prototype.hasOwnProperty.call(rawData, 'permissions');

          const permissions = hasCombinedShape
            ? (rawData as { permissions: { [key: string]: boolean } }).permissions
            : (rawData as { [key: string]: boolean });

          const sections = hasCombinedShape
            ? ((rawData as { sections?: SidebarSectionMeta[] }).sections ?? [])
            : [];

          return {
            permissions: this.normalizePermissionMap(permissions ?? {}),
            sections: this.mapSidebarSections(sections)
          };
        }),
        catchError(() =>
          of({
            permissions: this.userAccessService.getUserPermissions(userId),
            sections: {}
          })
        ),
        finalize(() => {
          if (this.loadingUserId === userId) this.loadingUserId = '';
        })
      )
      .subscribe(({ permissions, sections }) => {
        this.permissions$.next(permissions ?? {});
        this.sidebarSections$.next(sections ?? {});
        this.isLoaded$.next(true);
      });
  }

  canAccess(permId: string): boolean {
    if (this.isAdminUser$.getValue()) return true;
    return this.resolvePermId(permId, this.permissions$.getValue());
  }

  canAccessCta(ctaId: string): boolean {
    if (this.isAdminUser$.getValue()) return true;
    return this.permissions$.getValue()[ctaId] === true;
  }

  /** Reload permissions for the current non-admin user (call after admin saves perms). */
  reload(): void {
    const user = this.authService.currentUser();
    if (user && !this.isAdminUser$.getValue()) {
      const userId: string = (user as any).id ?? (user as any)._id ?? '';
      if (userId) {
        this.lastHandledUserId = '';
        this.fetchPermissions(userId);
      }
    }
  }

  private resolvePermId(permId: string, perms: { [key: string]: boolean }): boolean {
    if (perms[permId] === true) return true;

    const tree = this.userAccessService.getPermissionTree();
    for (const section of tree) {
      if (section.id === permId) {
        return section.pages.some(p => p.ctas.some(c => perms[c.id]));
      }
      const page = section.pages.find(p => p.id === permId);
      if (page) {
        return page.ctas.some(c => perms[c.id]);
      }
      for (const p of section.pages) {
        const cta = p.ctas.find(c => c.id === permId);
        if (cta) return perms[cta.id] === true;
      }
    }
    return false;
  }

  private normalizePermissionMap(perms: { [key: string]: boolean }): { [key: string]: boolean } {
    const normalized: { [key: string]: boolean } = { ...perms };
    const tree = this.userAccessService.getPermissionTree();

    tree.forEach(section => {
      const sectionGranted = normalized[section.id] === true;

      section.pages.forEach(page => {
        const pageGranted = sectionGranted || normalized[page.id] === true;

        if (pageGranted) {
          normalized[page.id] = true;
          page.ctas.forEach(cta => {
            normalized[cta.id] = true;
          });
        }

        if (page.ctas.some(cta => normalized[cta.id] === true)) {
          normalized[page.id] = true;
        }
      });

      if (section.pages.some(page => normalized[page.id] === true)) {
        normalized[section.id] = true;
      }
    });

    return normalized;
  }

  private mapSidebarSections(sections: SidebarSectionMeta[]): { [id: string]: { title: string; subtitle?: string } } {
    const mapped: { [id: string]: { title: string; subtitle?: string } } = {};
    sections.forEach(section => {
      if (section?.id && section?.title) {
        mapped[section.id] = { title: section.title, subtitle: section.subtitle };
      }
    });
    return mapped;
  }
}
