import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { ToastComponent } from './components/toast/toast.component';
import { ThemeService } from './services/theme.service';
import { PermissionService } from './services/permission.service';

@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet, ToastComponent],
})
export class AppComponent {
  private readonly _theme = inject(ThemeService);
  private readonly _perms = inject(PermissionService);
}
