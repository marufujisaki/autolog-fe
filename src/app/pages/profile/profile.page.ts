import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/ports/auth.port';
import { UserType } from '../../core/models/user.model';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import {
  LucideAngularModule,
  PencilIcon,
  PlusIcon,
  WrenchIcon,
  LogOutIcon,
} from 'lucide-angular';

/**
 * ProfilePage — User profile with mechanics/clients list and sharing toggle.
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent, LucideAngularModule],
})
export class ProfilePage implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  readonly PencilIcon = PencilIcon;
  readonly PlusIcon = PlusIcon;
  readonly WrenchIcon = WrenchIcon;
  readonly LogOutIcon = LogOutIcon;

  userName = 'Juan Perez';
  userEmail = 'example@autolog.com';
  userType: UserType = UserType.USUARIO;
  allowSharing = false;
  isSharingLoading = false;

  // Mock mechanics data
  mechanics = [
    {
      name: 'Taller La Candelaria',
      contact: 'Sr Gerardo',
      phone: '+584120483325',
    },
    {
      name: 'Taller XYZ',
      contact: 'Maria Garcia',
      phone: '+584121234567',
    },
  ];

  get isUsuario(): boolean {
    return this.userType === UserType.USUARIO;
  }

  ngOnInit(): void {
    this.authService.user$?.subscribe((user) => {
      if (user) {
        this.userName = `${user.firstName} ${user.lastName}`;
        this.userEmail = user.email;
        this.userType = user.userType;
        this.allowSharing = user.allowSharing ?? false;
      }
    });
  }

  onSharingToggle(enabled: boolean): void {
    this.isSharingLoading = true;
    this.authService.updateAllowSharing(enabled).subscribe({
      next: () => {
        this.allowSharing = enabled;
        this.isSharingLoading = false;
      },
      error: () => {
        // Revert on failure
        this.allowSharing = !enabled;
        this.isSharingLoading = false;
      },
    });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }
}
