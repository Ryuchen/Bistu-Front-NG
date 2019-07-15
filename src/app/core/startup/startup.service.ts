import { Injectable, Injector, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { MenuService, SettingsService, TitleService, ALAIN_I18N_TOKEN } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ACLService } from '@delon/acl';
import { TranslateService } from '@ngx-translate/core';
import { I18NService } from '../i18n/i18n.service';

import { NzIconService } from 'ng-zorro-antd/icon';
import { ICONS_AUTO } from '../../../style-icons-auto';
import { ICONS } from '../../../style-icons';

import { LocalStorageService, SessionStorageService } from 'ngx-webstorage';
/**
 * Used for application startup
 * Generally used to get the basic data of the application, like: Menu Data, User Data, etc.
 */
@Injectable()
export class StartupService {
  constructor(
    iconSrv: NzIconService,
    private menuService: MenuService,
    private translate: TranslateService,
    @Inject(ALAIN_I18N_TOKEN) private i18n: I18NService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: HttpClient,
    private injector: Injector,
    private localStorageService: LocalStorageService,
    private sessionStorageService: SessionStorageService,
  ) {
    iconSrv.addIcon(...ICONS_AUTO, ...ICONS);
  }

  private viaHttp(resolve: any, reject: any) {
    zip(
      this.httpClient.get('settings/translation/?_allow_anonymous=true&format=json'),
      this.httpClient.get('settings/application/?_allow_anonymous=true&format=json'),
      this.httpClient.get('settings/definitions/?_allow_anonymous=true&format=json'),
    )
      .pipe(
        catchError(([langData, appData, mappingData]) => {
          resolve(null);
          return [langData, appData, mappingData];
        }),
      )
      .subscribe(
        ([langData, appData, mappingData]) => {
          const {
            data: { translation, default: defaultLang },
          } = langData;
          // Setting language data
          this.translate.setTranslation(defaultLang, translation);
          this.translate.setDefaultLang(defaultLang);

          // Setting mapping data
          for (const key in mappingData) {
            if (this.localStorageService.retrieve(key) == null) {
              this.localStorageService.store(key, mappingData[key]);
            }
          }

          // Application data
          const { app } = appData;
          // Application information: including site name, description, year
          this.settingService.setApp(app);

          // ACL: Set the permissions to full, https://ng-alain.com/acl/getting-started
          this.aclService.setFull(true);
          // Menu data, https://ng-alain.com/theme/menu
          this.menuService.add([
            {
              text: 'Main',
              group: true,
              children: [
                {
                  text: 'Dashboard',
                  link: '/dashboard',
                  icon: { type: 'icon', value: 'appstore' },
                },
                {
                  text: 'Quick Menu',
                  icon: { type: 'icon', value: 'rocket' },
                  shortcutRoot: true,
                },
              ],
            },
          ]);

          // Can be set page suffix title, https://ng-alain.com/theme/title
          this.titleService.suffix = app.name;

          // 启动的时候判断当前有没有存储 token 值，如果存储则直接跳转到首页，否则跳转到登录页面
          const tokenData = this.tokenService.get();
          if (!tokenData.token) {
            this.injector.get(Router).navigateByUrl('/passport/login');
          } else {
            this.httpClient.get('accounts/current/').subscribe(userData => {
              // User information: including name, avatar, email address
              const {
                data: { profile, authority, permission },
              } = userData as any;

              // 设置用户的认证信息
              this.sessionStorageService.store('authority', authority);
              this.sessionStorageService.store('permission', permission);

              this.settingService.setUser(profile);
            });
          }
        },
        () => {},
        () => {
          resolve(null);
        },
      );
  }

  load(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.viaHttp(resolve, reject);
    });
  }
}
