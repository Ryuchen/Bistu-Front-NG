import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { _HttpClient, SettingsService } from '@delon/theme';

@Component({
  selector: 'app-dashboard-workplace',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  academies: any[];
  loading = true;

  constructor(
    private http: _HttpClient,
    private cdr: ChangeDetectorRef,
    public msg: NzMessageService,
    public settingService: SettingsService,
  ) {}

  ngOnInit() {
    this.http.get('colleges/academies/').subscribe((res: any) => {
      this.academies = res.map((item: any) => {
        // 取出我们需要的数据内容，并不是将全部的数据交给渲染层使用
        const academy = {
          name: item.aca_cname,
          avatar: item.aca_avatar,
          phone: item.aca_phone,
          link: item.aca_href,
          students: item.student_count,
          majors: item.aca_majors.length,
        };
        return academy;
      });
      this.loading = false;
      this.cdr.detectChanges();
    });
  }
}
