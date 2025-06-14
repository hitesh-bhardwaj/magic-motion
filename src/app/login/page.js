import { Suspense } from 'react';
import LoginForm from './LoginForm';

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
