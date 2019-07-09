import { SettingsService, _HttpClient } from '@delon/theme';
import { Component, Inject, Optional } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { SocialService, ITokenService, DA_SERVICE_TOKEN } from '@delon/auth';
import { StartupService } from '@core';
import { SessionStorageService } from 'ngx-webstorage';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
  providers: [SocialService],
})
export class UserLoginComponent {
  constructor(
    public fb: FormBuilder,
    public http: _HttpClient,
    public msg: NzMessageService,
    public modalSrv: NzModalService,
    private router: Router,
    @Optional()
    @Inject(DA_SERVICE_TOKEN)
    private tokenService: ITokenService,
    private startupService: StartupService,
    private sessionStorageService: SessionStorageService,
  ) {
    this.form = fb.group({
      username: [null, [Validators.required, Validators.minLength(4)]],
      password: [null, Validators.required],
      remember: [true],
    });
    modalSrv.closeAll();
  }

  // #region fields

  get username() {
    return this.form.controls.username;
  }
  get password() {
    return this.form.controls.password;
  }
  get remember() {
    return this.form.controls.remember;
  }

  form: FormGroup;

  submit() {
    this.username.markAsDirty();
    this.username.updateValueAndValidity();
    this.password.markAsDirty();
    this.password.updateValueAndValidity();
    if (this.username.invalid || this.password.invalid) {
      return;
    }
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
    // 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验
    this.http
      .post(
        'accounts/login/',
        {
          username: this.username.value,
          password: this.password.value,
          remember: this.remember.value,
        },
        null,
        { headers },
      )
      .subscribe((res: any) => {
        const {
          data: { authority, permission, token },
        } = res;
        // 设置用户的认证信息
        this.sessionStorageService.store('authority', authority);
        this.sessionStorageService.store('permission', permission);
        this.tokenService.set({ token: `${token}` });

        // 重新获取 StartupService 内容，我们始终认为应用信息一般都会受当前用户授权范围而影响
        this.startupService.load().then(() => {
          let url = this.tokenService.referrer!.url || '/';
          if (url.includes('/passport')) {
            url = '/';
          }
          this.router.navigateByUrl(url);
        });
      });
  }
}
