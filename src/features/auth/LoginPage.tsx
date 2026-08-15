import { useState, type FormEvent, type ReactElement } from 'react';
import { Navigate } from 'react-router';
import { AppError } from '@/shared/api/error-type';
import { useAuthStore } from './auth-store';
import { login } from './utils/auth-actions';

/**
 * 登入頁：採用 daisyUI Hero with form。
 */
export function LoginPage(): ReactElement {
  const session = useAuthStore((state) => state.session);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (session.status === 'AUTHENTICATED') {
    return <Navigate to="/users" replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setErrorMessage(null);
    setPending(true);
    try {
      await login(username, password);
    } catch (error) {
      const message = error instanceof AppError ? error.message : '登入失敗，請稍後再試';
      setErrorMessage(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="hero flex-1 bg-base-200">
      <div className="hero-content w-full flex-col gap-14 xl:flex-row-reverse">
        <div className="w-auto shrink-0 text-center xl:text-left">
          <h1 className="text-5xl font-bold">登入</h1>
          <p className="py-6">請輸入帳號與密碼以繼續。</p>
        </div>
        <div className="card w-full max-w-sm shrink-0 bg-base-100 shadow-2xl">
          <form className="card-body" onSubmit={(event) => void handleSubmit(event)}>
            <fieldset className="fieldset">
              <label className="label" htmlFor="username">
                帳號
              </label>
              <input
                className="input w-full"
                id="username"
                name="username"
                autoComplete="username"
                placeholder="帳號"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                aria-invalid={errorMessage !== null}
                aria-describedby={errorMessage !== null ? 'login-error' : undefined}
                required
              />
              <label className="label" htmlFor="password">
                密碼
              </label>
              <input
                className="input w-full"
                id="password"
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="密碼"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={errorMessage !== null}
                aria-describedby={errorMessage !== null ? 'login-error' : undefined}
                required
              />
              {errorMessage !== null ? (
                <div className="alert w-full alert-error" id="login-error" role="alert">
                  <span>{errorMessage}</span>
                </div>
              ) : null}
              <button className="btn mt-4 btn-block btn-neutral" type="submit" disabled={pending}>
                登入
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </main>
  );
}
