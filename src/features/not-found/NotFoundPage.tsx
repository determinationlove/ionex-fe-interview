import { type ReactElement } from 'react';
import { Link } from 'react-router';

/**
 * 找不到頁面。
 */
export function NotFoundPage(): ReactElement {
  return (
    <main className="hero flex-1 bg-base-200">
      <div className="hero-content text-center">
        <div className="max-w-md">
          <h1 className="text-4xl font-bold">找不到頁面</h1>
          <p className="py-4">這個網址不存在。</p>
          <Link className="btn btn-primary" to="/users">
            回到首頁
          </Link>
        </div>
      </div>
    </main>
  );
}
