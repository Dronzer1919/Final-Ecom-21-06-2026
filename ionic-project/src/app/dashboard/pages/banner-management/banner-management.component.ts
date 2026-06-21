import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BannerService, Banner } from '../../../services/banner.service';
import { ToastService } from '../../../services/toast.service';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';

@Component({
  selector: 'app-banner-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ThemeButtonComponent],
  templateUrl: './banner-management.component.html',
  styleUrls: ['./banner-management.component.scss']
})
export class BannerManagementComponent implements OnInit {
  banners: Banner[] = [];
  filteredBanners: Banner[] = [];
  loading = false;
  error: string | null = null;
  
  // Modal
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  selectedBanner: Banner | null = null;
  
  // Form data
  formData: Banner = {
    title: '',
    subtitle: '',
    image: '',
    buttonText: 'SHOP NOW',
    buttonLink: '/shop',
    order: 0,
    isActive: true
  };
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;
  
  // Search
  searchTerm = '';

  private toastService = inject(ToastService);

  constructor(private bannerService: BannerService) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.loading = true;
    this.error = null;

    this.bannerService.getAllBanners().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.banners = response.data;
          this.filteredBanners = this.banners;
          this.totalItems = this.banners.length;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load banners';
        this.toastService.error('Failed to load banners');
        this.loading = false;
      }
    });
  }

  filterBanners(): void {
    if (!this.searchTerm) {
      this.filteredBanners = this.banners;
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredBanners = this.banners.filter(banner =>
        banner.title.toLowerCase().includes(term) ||
        (banner.subtitle && banner.subtitle.toLowerCase().includes(term))
      );
    }
    this.totalItems = this.filteredBanners.length;
    this.currentPage = 1;
  }

  get paginatedBanners(): Banner[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredBanners.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  openAddModal(): void {
    this.modalMode = 'add';
    this.selectedBanner = null;
    this.formData = {
      title: '',
      subtitle: '',
      image: '',
      buttonText: 'SHOP NOW',
      buttonLink: '/shop',
      order: 0,
      isActive: true
    };
    this.showModal = true;
  }

  openEditModal(banner: Banner): void {
    this.modalMode = 'edit';
    this.selectedBanner = banner;
    this.formData = {
      title: banner.title,
      subtitle: banner.subtitle || '',
      image: banner.image,
      buttonText: banner.buttonText || 'SHOP NOW',
      buttonLink: banner.buttonLink || '/shop',
      order: banner.order || 0,
      isActive: banner.isActive !== false
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedBanner = null;
    this.formData = {
      title: '',
      subtitle: '',
      image: '',
      buttonText: 'SHOP NOW',
      buttonLink: '/shop',
      order: 0,
      isActive: true
    };
  }

  saveBanner(): void {
    if (!this.formData.title || !this.formData.image) {
      this.toastService.warning('Please fill in all required fields');
      return;
    }

    this.loading = true;

    if (this.modalMode === 'add') {
      this.bannerService.createBanner(this.formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadBanners();
            this.closeModal();
            this.toastService.success('Banner created successfully!');
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.toastService.error('Failed to create banner');
          this.loading = false;
        }
      });
    } else {
      if (!this.selectedBanner?._id) return;
      
      this.bannerService.updateBanner(this.selectedBanner._id, this.formData).subscribe({
        next: (response: any) => {
          if (response.success) {
            this.loadBanners();
            this.closeModal();
            this.toastService.success('Banner updated successfully!');
          }
          this.loading = false;
        },
        error: (err: any) => {
          this.toastService.error('Failed to update banner');
          this.loading = false;
        }
      });
    }
  }

  deleteBanner(banner: Banner): void {
    if (!confirm(`Are you sure you want to delete "${banner.title}"?`)) {
      return;
    }

    if (!banner._id) return;

    this.loading = true;

    this.bannerService.deleteBanner(banner._id).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadBanners();
          this.toastService.success('Banner deleted successfully!');
        }
        this.loading = false;
      },
      error: (err: any) => {
        this.toastService.error('Failed to delete banner');
        this.loading = false;
      }
    });
  }

  toggleStatus(banner: Banner): void {
    if (!banner._id) return;

    const updatedBanner = {
      ...banner,
      isActive: !banner.isActive
    };

    this.bannerService.updateBanner(banner._id, updatedBanner).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.loadBanners();
        }
      },
      error: (err: any) => {
        this.toastService.error('Failed to update banner status');
      }
    });
  }

  // Pagination
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
}
