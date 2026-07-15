import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/ports/auth.port';
import { ButtonComponent } from '../../presentation/shared/components/button/button.component';
import {
  LucideAngularModule,
  PencilIcon,
  PlusIcon,
  WrenchIcon,
  LogOutIcon,
} from 'lucide-angular';

/**
 * ProfilePage — User profile with mechanics/clients list (Figma: "Profile - Client / Personal").
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: true,
  imports: [CommonModule, ButtonComponent, LucideAngularModule],
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

  ngOnInit(): void {
    // Load user profile from auth service
    this.authService.user$?.subscribe((user) => {
      if (user) {
        this.userName = `${user.firstName} ${user.lastName}`;
        this.userEmail = user.email;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    void this.router.navigate(['/']);
  }
}
