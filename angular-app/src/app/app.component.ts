import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: []
})
export class AppComponent {
  constructor() {
    console.log('App component - Constructor called - Router ready');
  }
}  

//added new branch
//after merge i am agian doing `git pull` to get the latest changes from the remote repository