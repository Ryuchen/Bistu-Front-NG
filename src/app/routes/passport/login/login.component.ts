import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { _HttpClient } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';

import { StartupService } from '@core';

import { NzMessageService, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'passport-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.less'],
})
export class UserLoginComponent {
  loginForm: FormGroup;
  forgotForm: FormGroup;
  isVisibleTop = false;

  constructor(
    public fb: FormBuilder,
    public http: _HttpClient,
    public msg: NzMessageService,
    private router: Router,
    @Inject(DA_SERVICE_TOKEN)
    private tokenService: ITokenService,
    private forgotService: NzModalService,
    private startupService: StartupService, // private sessionStorageService: SessionStorageService,
  ) {
    this.loginForm = fb.group({
      username: [null, [Validators.required, Validators.minLength(4)]],
      password: [null, Validators.required],
      remember: [true],
    });
    this.forgotForm = fb.group({
      number: [null, [Validators.required, Validators.minLength(8)]],
      email: [null, Validators.required, Validators.email],
    });
  }

  get username() {
    return this.loginForm.controls.username;
  }
  get password() {
    return this.loginForm.controls.password;
  }
  get remember() {
    return this.loginForm.controls.remember;
  }

  submitLogin() {
    this.username.markAsDirty();
    this.username.updateValueAndValidity();
    this.password.markAsDirty();
    this.password.updateValueAndValidity();
    if (this.username.invalid || this.password.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('username', this.username.value);
    formData.append('password', this.password.value);
    formData.append('remember', this.remember.value);

    // 默认配置中对所有HTTP请求都会强制 [校验](https://ng-alain.com/auth/getting-started) 用户 Token
    // 然一般来说登录请求不需要校验，因此可以在请求URL加上：`/login?_allow_anonymous=true` 表示不触发用户 Token 校验
    this.http.post('accounts/login/?_allow_anonymous=true', formData).subscribe((res: any) => {
      // 保存用户的 token 信息在缓存里面
      this.tokenService.set(res.data);

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

  forgotModel(): void {
    this.isVisibleTop = true;
  }

  handleCancelForgot(): void {
    this.isVisibleTop = false;
  }

  handleOkForgot(): void {
    console.log('点击了确定');
    this.isVisibleTop = false;
  }
}
