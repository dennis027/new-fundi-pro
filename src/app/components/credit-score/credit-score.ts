import { Component, inject, PLATFORM_ID, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AppBarService } from '../../services/app-bar-service';
import { GigServices } from '../../services/gig-services';
import { Router } from '@angular/router';

interface ScoreData {
  timestamp: string;
  new_score: number;
}

@Component({
  selector: 'app-credit-score',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './credit-score.html',
  styleUrl: './credit-score.css',
})
export class CreditScore implements OnInit, OnDestroy {
  private appBar = inject(AppBarService);
  private gigServices = inject(GigServices);
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  isLoading = signal(true);
  scores = signal<ScoreData[]>([]);
  animateIn = signal(false);
  chartWidth = signal(400);

  // Make Math available in template
  Math = Math;

  ngOnInit() {
    this.appBar.setTitle('Gig Completion Rate');
    this.appBar.setBack(true);

    this.appBar.setActions([
      {
        id: 'refresh',
        icon: 'refresh',
        ariaLabel: 'Refresh Data',
        onClick: () => this.getCreditScore(),
      }
    ]);

    if (isPlatformBrowser(this.platformId)) {
      this.updateChartWidth();
      window.addEventListener('resize', this.updateChartWidth);
      this.getCreditScore();
    }
  }

  updateChartWidth = () => {
    const w = Math.min(window.innerWidth - 80, 800);
    this.chartWidth.set(w);
  };

  getCreditScore() {
    this.isLoading.set(true);
    this.animateIn.set(false);
    
    this.gigServices.creditScore().subscribe({
      next: (data: ScoreData[]) => {
        console.log('Credit Score Data:', data);
        this.scores.set(data);
        this.isLoading.set(false);
        
        // Trigger animation after a brief delay
        setTimeout(() => this.animateIn.set(true), 100);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 401) {
          this.router.navigate(['/login']);
        } else {
          console.error('Error fetching credit score data:', error);
        }
      }
    });
  }

  get currentScore(): number {
    const scoresArray = this.scores();
    if (scoresArray.length === 0) return 0;
    return scoresArray[scoresArray.length - 1].new_score;
  }

  get averageScore(): number {
    const scoresArray = this.scores();
    if (scoresArray.length === 0) return 0;
    const sum = scoresArray.reduce((acc, curr) => acc + curr.new_score, 0);
    return sum / scoresArray.length;
  }

  get scoreChange(): string {
    const scoresArray = this.scores();
    if (scoresArray.length < 2) return "0";
    const latest = scoresArray[scoresArray.length - 1].new_score;
    const previous = scoresArray[scoresArray.length - 2].new_score;
    const change = latest - previous;
    return change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1);
  }

  get scoreColor(): string {
    if (this.currentScore >= 80) return '#10b981'; // green
    if (this.currentScore >= 60) return '#f59e0b'; // orange
    return '#ef4444'; // red
  }

  get performanceLevel(): { title: string; message: string; icon: string } {
    const score = this.currentScore;
    if (score >= 80) {
      return {
        title: 'Excellent Performance!',
        message: 'Keep up the great work!',
        icon: 'celebration'
      };
    }
    if (score >= 60) {
      return {
        title: 'Good Performance',
        message: "You're on the right track",
        icon: 'trending_up'
      };
    }
    return {
      title: 'Room for Improvement',
      message: 'Focus on completing more gigs',
      icon: 'trending_down'
    };
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  }

  getChartHeight(): number {
    return 250;
  }

  // ✅ FIX — now stable via signal
  getChartWidth(): number {
    return this.chartWidth();
  }

  calculateX(index: number): number {
    const scoresArray = this.scores();
    const width = this.getChartWidth();
    const padding = 40;
    const availableWidth = width - (padding * 2);
    return padding + (index / Math.max(scoresArray.length - 1, 1)) * availableWidth;
  }

  calculateY(score: number): number {
    const height = this.getChartHeight();
    const padding = 20;
    const availableHeight = height - (padding * 2);
    return height - padding - (score / 100) * availableHeight;
  }

  getPathData(): string {
    const scoresArray = this.scores();
    if (scoresArray.length === 0) return '';

    let path = '';
    scoresArray.forEach((score, index) => {
      const x = this.calculateX(index);
      const y = this.calculateY(score.new_score);
      
      if (index === 0) {
        path += `M ${x} ${y}`;
      } else {
        const prevX = this.calculateX(index - 1);
        const prevY = this.calculateY(scoresArray[index - 1].new_score);
        const cpX = (prevX + x) / 2;
        path += ` Q ${cpX} ${prevY}, ${x} ${y}`;
      }
    });

    return path;
  }

  getAreaPathData(): string {
    const scoresArray = this.scores();
    if (scoresArray.length === 0) return '';

    const linePath = this.getPathData();
    const height = this.getChartHeight();
    const lastX = this.calculateX(scoresArray.length - 1);
    const firstX = this.calculateX(0);

    return `${linePath} L ${lastX} ${height - 20} L ${firstX} ${height - 20} Z`;
  }

  get tips(): string[] {
    return [
      'Complete gigs on time to boost your rate',
      'Communicate with clients if delays occur',
      'Focus on quality over quantity',
      'Set realistic deadlines for your gigs'
    ];
  }

  shouldShowXAxisLabel(index: number): boolean {
    const scoresArray = this.scores();
    if (scoresArray.length <= 7) return true;
    return index % Math.ceil(scoresArray.length / 5) === 0;
  }

  ngOnDestroy() {
    this.appBar.clearActions();

    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.updateChartWidth);
    }
  }
}
