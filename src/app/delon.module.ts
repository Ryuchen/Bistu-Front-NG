/**
 * 进一步对基础模块的导入提炼
 * 有关模块注册指导原则请参考：https://ng-alain.com/docs/module
 */
import { NgModule, Optional, SkipSelf, ModuleWithProviders } from '@angular/core';
import { throwIfAlreadyLoaded } from '@core';

import { AlainThemeModule } from '@delon/theme';
import { DelonACLModule } from '@delon/acl';
import { DA_STORE_TOKEN, SessionStorageStore, DelonAuthConfig } from '@delon/auth';

// #region global config functions

import { PageHeaderConfig } from '@delon/abc';
export function fnPageHeaderConfig(): PageHeaderConfig {
  return {
    ...new PageHeaderConfig(),
    homeI18n: 'home',
  };
}
export function fnDelonAuthConfig(): DelonAuthConfig {
  return {
    ...new DelonAuthConfig(),
    token_send_key: `Authorization`,
    // tslint:disable-next-line: no-invalid-template-strings
    token_send_template: 'JWT ${token}',
    token_send_place: 'header',
    login_url: '/passport/login',
    ignores: [/settings/, /accounts\/login/],
  };
}

// tslint:disable-next-line: no-duplicate-imports
import { STConfig } from '@delon/abc';
export function fnSTConfig(): STConfig {
  return {
    ...new STConfig(),
    modal: { size: 'lg' },
  };
}

const GLOBAL_CONFIG_PROVIDES = [
  // TIPS：@delon/abc 有大量的全局配置信息，例如设置所有 `st` 的页码默认为 `20` 行
  { provide: STConfig, useFactory: fnSTConfig },
  { provide: PageHeaderConfig, useFactory: fnPageHeaderConfig },
  { provide: DelonAuthConfig, useFactory: fnDelonAuthConfig },
];

// #endregion

@NgModule({
  imports: [AlainThemeModule.forRoot(), DelonACLModule.forRoot()],
})
export class DelonModule {
  constructor(@Optional() @SkipSelf() parentModule: DelonModule) {
    throwIfAlreadyLoaded(parentModule, 'DelonModule');
  }

  static forRoot(): ModuleWithProviders {
    return {
      ngModule: DelonModule,
      providers: [...GLOBAL_CONFIG_PROVIDES, { provide: DA_STORE_TOKEN, useClass: SessionStorageStore }],
    };
  }
}