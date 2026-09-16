/**
 * Public surface of the auth feature. Import from `@/features/auth`, not from
 * deep paths, in code outside this folder.
 */
export { AuthProvider } from './context/AuthProvider';
export { useAuth } from './hooks/useAuth';
export { LoginPage } from './pages/LoginPage';
export { ROLES } from './roles';
