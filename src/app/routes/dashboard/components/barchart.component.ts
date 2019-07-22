import { Component, OnInit } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-piechart',
  template: `
    <nz-card nzTitle="各学院历年招生" [nzBordered]="false" class="mb-lg project-list">
      <g2-bar height="200" [data]="trendData"></g2-bar>
    </nz-card>
  `,
})
export class BarchartComponent implements OnInit {
  trendData: any[] = [];
  academy: string;

  constructor(private http: _HttpClient) {
    this.academy = '信息管理学院';
  }

  ngOnInit() {
    this.http.get('students/trending/').subscribe((res: any) => {
      const { statistic } = res;
      const academyTrendingData = {};
      statistic.map((item: any) => {
        const { stu_academy__aca_cname: academy, stu_entrance_time__year: x, count: y } = item;
        if (academy in academyTrendingData) {
          academyTrendingData[academy].push({ x, y });
        } else {
          academyTrendingData[academy] = [];
          academyTrendingData[academy].push({ x, y });
        }
      });
      this.trendData = academyTrendingData[this.academy];
    });
  }
}
