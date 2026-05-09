import { ChangeDetectionStrategy, Component } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare const __LOGIN_URL__: string;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  readonly loginUrl =
    typeof __LOGIN_URL__ !== 'undefined' && __LOGIN_URL__ ? __LOGIN_URL__ : 'https://app.example.com/login';
  selectedCurrency: 'INR' | 'USD' = 'INR';

  monthlyCallVolume = 3000;
  averageCallDuration = 4;
  costPerHumanAgent = 40000;
  numberOfAgents = 8;
  aiRatePerMinute = 12;
  automationPercentage = 60;

  get totalMonthlyHumanCost(): number {
    return this.costPerHumanAgent * this.numberOfAgents;
  }

  get estimatedAiOnlyCost(): number {
    return this.totalMonthlyCallMinutes * (this.automationPercentage / 100) * this.aiRatePerMinute;
  }

  get estimatedMonthlyCostWithAi(): number {
    const retainedHumanCost = this.totalMonthlyHumanCost * (1 - this.automationPercentage / 100);
    return retainedHumanCost + this.estimatedAiOnlyCost;
  }

  get estimatedSavings(): number {
    return Math.max(this.totalMonthlyHumanCost - this.estimatedMonthlyCostWithAi, 0);
  }

  get savingsPercentage(): number {
    if (!this.totalMonthlyHumanCost) {
      return 0;
    }
    return (this.estimatedSavings / this.totalMonthlyHumanCost) * 100;
  }

  get estimatedPaybackMonths(): number {
    const oneTimeSetupCost = this.estimatedAiOnlyCost;
    if (!this.estimatedSavings) {
      return 0;
    }
    return oneTimeSetupCost / this.estimatedSavings;
  }

  get totalMonthlyCallMinutes(): number {
    return this.monthlyCallVolume * this.averageCallDuration;
  }

  get aiRateMin(): number {
    return this.selectedCurrency === 'INR' ? 10 : 0.12;
  }

  get aiRateMax(): number {
    return this.selectedCurrency === 'INR' ? 15 : 0.18;
  }

  get aiRateStep(): number {
    return this.selectedCurrency === 'INR' ? 0.5 : 0.01;
  }

  setCurrency(currency: 'INR' | 'USD'): void {
    this.selectedCurrency = currency;
    this.aiRatePerMinute = currency === 'INR' ? 12 : 0.15;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat(this.selectedCurrency === 'INR' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: this.selectedCurrency,
      maximumFractionDigits: 0,
    }).format(value);
  }
}
