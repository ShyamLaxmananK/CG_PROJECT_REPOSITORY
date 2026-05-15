import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../config/environment';

@Injectable({ providedIn: 'root' })
export class ApiBaseService {
  protected readonly http = inject(HttpClient);
  protected readonly environment = environment;

  protected url(path: string): string {
    return `${this.environment.apiGatewayUrl}${path}`;
  }
}
