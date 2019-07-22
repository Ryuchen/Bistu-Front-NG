import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-barchart',
  template: `
    <nz-card nzTitle="历年招生占比" [nzBordered]="false" class="ant-card__body-nopadding mb-lg project-list">
      <div class="ratio-header">
        <nz-radio-group [(ngModel)]="radioYear">
          <label *ngFor="let item of entranceYears" nz-radio-button [nzValue]="item">{{ item }}</label>
        </nz-radio-group>
      </div>
      <div class="radio-chart">
        <g2-pie
          [hasLegend]="true"
          title="招生人数"
          subTitle="招生人数"
          [total]="total"
          [valueFormat]="format"
          [data]="ratioData"
          height="294"
        ></g2-pie>
      </div>
    </nz-card>
  `,
  styles: ['.g2-pie__legend { right: 0; min-width: 200px; margin: 0 20px; padding: 0; list-style: none; }'],
})
export class PiechartComponent implements OnInit {
  ratioData: any[] = [];
  entranceYears: any[] = [];
  radioYear: any;
  total: string;

  constructor(private http: _HttpClient) {
    const year = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.entranceYears.push(year - i);
    }
    this.radioYear = year;
  }

  ngOnInit() {
    this.http.get('students/ratio/').subscribe((res: any) => {
      this.ratioData = res.data.ratio.map((item: any) => {
        const data = {
          x: item.aca_cname,
          y: item.total,
        };
        return data;
      });
      this.total = `学生人数： ${this.ratioData.reduce((pre, now) => now.y + pre, 0).toFixed(2)}`;
    });
  }

  format(val: number) {
    return `学生人数： ${val}`;
  }
}
