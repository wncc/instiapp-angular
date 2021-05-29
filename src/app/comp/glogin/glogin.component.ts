import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DataService } from '../../data.service';

@Component({
  selector: 'app-glogin',
  templateUrl: './glogin.component.html',
  styleUrls: ['./glogin.component.css']
})
export class GLoginComponent implements OnInit {

  /** Currently authenticating */
  public authenticating = false;

  public error;

  constructor(
    public activatedRoute: ActivatedRoute,
    public dataService: DataService,
    public router: Router,
  ) { }

  ngOnInit() {
    this.dataService.setTitle('Google Login');
    if (this.dataService.isLoggedIn()) {
      this.router.navigate(['feed']);
      return;
    }

    const params = this.activatedRoute.snapshot.queryParams;
    if (params.hasOwnProperty('code')) {
      console.log('code', params['code']);
      this.authenticating = true;
      const auth_code = params['code'];
      this.dataService.AuthenticateGLogin(auth_code).subscribe(() => {
        this.dataService.GetFillCurrentUser().subscribe(() => {
          const redir = localStorage.getItem(this.dataService.LOGIN_REDIR);
          if (redir && redir !== '') {
            localStorage.setItem(this.dataService.LOGIN_REDIR, '');
            const rpath: any[] = this.dataService.DecodeObject(redir);
            this.router.navigate(rpath);
          } else {
            this.router.navigate(['feed']);
          }
        });
      }, (e) => {
        console.log(e);
        this.error = e.status;
      });
    } else {
      this.authenticating = false;
    }
  }

  /** Open a new tab for SSO login */
  login() {
    const endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';
    const clientid = '283642720122-426e6bgmqi7hbh6pf1q2jjsbee4o2lh1.apps.googleusercontent.com';
    const redir = 'http://localhost:4200/glogin';
    const scope = 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid';

    window.location.href = `${endpoint}?client_id=${clientid}&response_type=code&scope=${scope}&redirect_uri=${redir}`;
  }
}
