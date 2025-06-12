import { Suspense } from 'react';
import SignUpForm from './signUpForm';

export default function Login() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}
