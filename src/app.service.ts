import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  main(): string {
    return 'OK';
  }
}
