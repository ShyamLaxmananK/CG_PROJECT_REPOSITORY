import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ApiBaseService } from './api-base.service';
import { ApiListResponse } from '../models/api.models';
import { AuthUser } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AdminService extends ApiBaseService {
  getUsers() {
    return this.http
      .get<Array<{ id: number; username: string; role: string }>>(
        this.url(this.environment.endpoints.customers)
      )
      .pipe(
        map((users) => ({
          items: users.map((user) => ({
            id: user.id,
            username: user.username,
            fullName: user.username,
            email: '',
            role: user.role.replace('ROLE_', '') as AuthUser['role']
          }))
        }))
      );
  }
}
