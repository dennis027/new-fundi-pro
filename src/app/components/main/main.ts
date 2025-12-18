import { CommonModule } from '@angular/common';
import { Component, OnInit, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-main',
  imports: [CommonModule, RouterModule],
  templateUrl: './main.html',
  styleUrl: './main.css',
})
export class Main {
sidebarOpen = false;

toggleSidebar() {
  this.sidebarOpen = !this.sidebarOpen;
}

closeSidebar() {
  this.sidebarOpen = false;
}

onNavLinkClick() {
  if (window.innerWidth < 992) {
    this.closeSidebar();
  }
}


links = [
  { name: 'Dashboard', route: '/', icon: 'fas fa-chart-pie' },

];


  isSidebarActive = false;

  constructor(private authService : AuthService, private router:Router) {}

  ngOnInit(): void {}


  /**
   * Listen for window resize events to handle responsive behavior
   */
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    const width = (event.target as Window).innerWidth;
    
    // Auto-close sidebar on desktop view
    if (width > 992 && this.isSidebarActive) {
      this.closeSidebar();
    }
  }

  /**
   * Prevent body scroll when mobile sidebar is open
   */
  private toggleBodyScroll(): void {
    if (this.isSidebarActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }


logOut() {
  this.authService.logout().subscribe(() => {
    this.router.navigate(['/login']);
  });
}



}