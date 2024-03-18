import { SetMetadata } from '@nestjs/common';

// Reflector 를 이용한 권한 값 확인을 위한 키
export const ROLES_KEY = 'roles';
export const PUBLIC_KEY = 'public';

// Reflector 에서 키 값으로 인자값 확인
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
export const Public = () => SetMetadata(PUBLIC_KEY, true);
