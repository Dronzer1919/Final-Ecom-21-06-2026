import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ThemeButtonComponent } from '../../../components/buttons/theme-button/theme-button.component';
import { ShimmerDashboardHomeComponent } from '../../../components/shimmer/shimmer-dashboard-home/shimmer-dashboard-home.component';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, ThemeButtonComponent, ShimmerDashboardHomeComponent],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit, AfterViewInit {
  private charts: { [key: string]: Chart } = {};
  isPageLoading = signal(true);

  stats = [
    { label: 'Total Companies', value: '5468', icon: 'building', change: '+12%', trend: 'up', color: '#4F46E5' },
    { label: 'Active Companies', value: '4598', icon: 'chart', change: '+8%', trend: 'up', color: '#10B981' },
    { label: 'Total Stakeholders', value: '3698', icon: 'users', change: '+5%', trend: 'up', color: '#3B82F6' },
    { label: 'Total Earnings', value: '₹89,878.58', icon: 'dollar', change: '+15%', trend: 'up', color: '#EF4444' }
  ];

  recentTransactions = [
    { company: 'Stellar Dynamics', id: '#LU657', date: '24 Jan 2025', amount: '+₹245', status: 'completed', type: 'Basic' },
    { company: 'Quantum Nexus', id: '#5974', date: '10 Jan 2025', amount: '-₹395', status: 'completed', type: 'Premium' },
    { company: 'Aurora Technologies', id: '#2398', date: '03 Jan 2025', amount: '+₹145', status: 'pending', type: 'Enterprise' },
    { company: 'TerraFusion Energy', id: '#8421', date: '01 Jan 2025', amount: '+₹788', status: 'completed', type: 'Basic' },
    { company: 'Epicurean Delights', id: '#3587', date: '01 Jan 2025', amount: '-₹977', status: 'failed', type: 'Premium' }
  ];

  recentlyRegistered = [
    { company: 'Pitch', plan: 'Enterprise', users: 150, icon: '🎯' },
    { company: 'Quantum Nexus', plan: 'Enterprise (Yearly)', users: 200, icon: '⚡' },
    { company: 'Umbrella Corp', plan: 'Advanced (Monthly)', users: 108, icon: '☂️' },
    { company: 'Capital Partners', plan: 'Enterprise (Monthly)', users: 110, icon: '💼' },
    { company: 'Massive Dynamic', plan: 'Premium (Yearly)', users: 120, icon: '🔷' }
  ];

  recentPlanExpired = [
    { company: 'Silicon Corp', date: '19 Mar 2025', status: 'expired' },
    { company: 'Quantum Nexus', date: '18 Mar 2025', status: 'expired' },
    { company: 'Luxe Industries', date: '16 Mar 2025', status: 'expired' },
    { company: 'TerraFusion Energy', date: '15 Mar 2025', status: 'expired' },
    { company: 'Epicurean Delights', date: '15 Mar 2025', status: 'expired' }
  ];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      Chart.register(...registerables);
    }
  }

  ngOnInit(): void {
    setTimeout(() => this.isPageLoading.set(false), 800);
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        this.createCompaniesChart();
        this.createRevenueChart();
        this.createTopPlansChart();
      }, 100);
    }
  }

  private createCompaniesChart(): void {
    const ctx = document.getElementById('companiesChart') as HTMLCanvasElement;
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
        datasets: [{
          label: 'Companies',
          data: [150, 180, 220, 240, 195, 260, 280],
          backgroundColor: '#3B4A6B',
          borderRadius: 6,
          barThickness: 40
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1F2937',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#E5E7EB'
            },
            ticks: {
              color: '#6B7280'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6B7280'
            }
          }
        }
      }
    };

    this.charts['companies'] = new Chart(ctx, config);
  }

  private createRevenueChart(): void {
    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Revenue',
          data: [35000, 42000, 38000, 45000, 52000, 48000, 55000, 58000, 53000, 60000, 65000, 62000],
          backgroundColor: '#FF8C42',
          borderRadius: 6,
          barThickness: 35
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#1F2937',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                return '$' + (context.parsed.y || 0).toLocaleString();
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: '#E5E7EB'
            },
            ticks: {
              color: '#6B7280',
              callback: function(value) {
                return '$' + value;
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: '#6B7280'
            }
          }
        }
      }
    };

    this.charts['revenue'] = new Chart(ctx, config);
  }

  private createTopPlansChart(): void {
    const ctx = document.getElementById('topPlansChart') as HTMLCanvasElement;
    if (!ctx) return;

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels: ['Basic', 'Premium', 'Enterprise'],
        datasets: [{
          data: [60, 20, 20],
          backgroundColor: ['#3B82F6', '#FF8C42', '#10B981'],
          borderWidth: 0,
          spacing: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              font: {
                size: 13
              }
            }
          },
          tooltip: {
            backgroundColor: '#1F2937',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: function(context) {
                return context.label + ': ' + context.parsed + '%';
              }
            }
          }
        }
      }
    };

    this.charts['topPlans'] = new Chart(ctx, config);
  }

  ngOnDestroy(): void {
    Object.values(this.charts).forEach(chart => chart.destroy());
  }
}
