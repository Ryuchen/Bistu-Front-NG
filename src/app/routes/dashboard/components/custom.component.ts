import { Component, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { _HttpClient } from '@delon/theme';

@Component({
  selector: 'app-custom',
  template: `
    <nz-card nzTitle="历年招生占比" [nzBordered]="false" class="ant-card__body-nopadding mb-lg project-list">
      <div class="ratio-header">
        <nz-radio-group [(ngModel)]="radioYear">
          <label *ngFor="let item of entranceYears" nz-radio-button [nzValue]="item">{{ item }}</label>
        </nz-radio-group>
      </div>
      <div class="radio-chart">
        <g2-custom (render)="render($event)"></g2-custom>
        <div id="nohidden" style="position: relative;margin: 20px auto;transform: translateX(25%);"></div>
      </div>
    </nz-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomComponent {
  ratioData: any[] = [];
  entranceYears: any[] = [];
  radioYear: any;

  constructor(private http: _HttpClient) {
    const year = new Date().getFullYear();
    for (let i = 0; i < 5; i++) {
      this.entranceYears.push(year - i);
    }
    this.radioYear = year;
  }

  render(el: ElementRef) {
    this.http.get('students/ratio/').subscribe((res: any) => {
      this.ratioData = res.data.ratio;
      const total = this.ratioData.reduce((pre, now) => now.total + pre, 0);
      const data = this.ratioData.map((item: any) => {
        const _ = {
          item: item.aca_cname,
          count: item.total,
          percent: item.total / total,
        };
        return _;
      });

      const chart = new G2.Chart({
        container: el.nativeElement,
        forceFit: true,
        width: '320',
        height: '320',
        padding: [20, 'auto', 30, 'auto'],
      });

      chart.source(data, {
        percent: {
          formatter: function formatter(val) {
            val = `${(val * 100).toFixed(2)}%`;
            return val;
          },
        },
      });
      chart.coord('theta', {
        radius: 1,
        innerRadius: 0.7,
      });
      chart.tooltip({
        showTitle: false,
        itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>',
      });
      chart.legend({
        layout: 'vertical',
        allowAllCanceled: false,
        useHtml: true,
        container: 'nohidden',
        itemTpl: (value: any, color: any, checked: boolean, index: number) => {
          const obj = data[index];
          return (
            '<tr class="g2-legend-list-item item-{index} {checked}" data-value="{value}" data-color={color} style="cursor: pointer;font-size: 14px;margin: 20px 0">' +
            '<td width=240 style="border: none;padding:0;text-align:left;">' +
            '<i class="g2-legend-marker" style="width:10px;height:10px;display:inline-block;margin-right:16px;background-color:{color};"></i>' +
            `<span class="g2-legend-text">${obj.item}</span> <strong>|</strong> <span class="g2-pie__legend-percent">${obj.percent}%</span>` +
            '</td>' +
            `<td style="border: none;padding:0;text-align:end;"> 人数: ${obj.count}</td>` +
            '</tr>'
          );
        },
      });
      // 辅助文本
      chart.guide().html({
        position: ['50%', '50%'],
        html: `<div style="color:#8c8c8c;font-size: 14px;text-align: center;width: 10em;"><strong>人数： ${total}</strong></div>`,
        alignX: 'middle',
        alignY: 'middle',
      });
      const interval = chart
        .intervalStack()
        .position('percent')
        .color('item')
        .tooltip('item*percent', (item: any, percent: any) => {
          percent = `${(percent * 100).toFixed(2)}%`;
          return {
            name: item,
            value: percent,
          };
        })
        .style({
          lineWidth: 1,
          stroke: '#fff',
        });
      chart.render();
    });
  }
}
