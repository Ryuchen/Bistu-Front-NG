import { Router } from '@angular/router';
import { Component, Inject } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SettingsService, _HttpClient } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { SessionStorageService } from 'ngx-webstorage';

@Component({
  selector: 'passport-lock',
  templateUrl: './lock.component.html',
  styleUrls: ['./lock.component.less'],
})
export class UserLockComponent {
  f: FormGroup;

  constructor(
    fb: FormBuilder,
    private router: Router,
    public http: _HttpClient,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    public settingsService: SettingsService,
    private sessionStorageService: SessionStorageService,
  ) {
    tokenService.clear();
    this.f = fb.group({
      password: [null, Validators.required],
    });
  }

  get username() {
    return this.sessionStorageService.retrieve('username');
  }

  get password() {
    return this.f.controls.password;
  }

  submit() {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    // tslint:disable-next-line:forin
    for (const i in this.f.controls) {
      this.f.controls[i].markAsDirty();
      this.f.controls[i].updateValueAndValidity();
    }
    if (this.f.valid) {
      this.http
        .post(
          'accounts/token-auth/?_allow_anonymous=true',
          {
            username: this.username,
            password: this.password.value,
          },
          null,
          { headers },
        )
        .subscribe((res: any) => {
          // 保存用户名在缓存里面，等用户锁屏的时候通过用户名可以直接解锁
          this.sessionStorageService.store('username', this.username);

          // 保存用户的 token 信息在缓存里面
          this.tokenService.set(res);

          this.router.navigate(['dashboard']);
        });
    }
  }
}
