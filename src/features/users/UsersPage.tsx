import { type ReactElement } from 'react';

/**
 * 受保護的使用者頁殼。Day 1 只證明已登入，不呼叫 /api/users。
 */
export function UsersPage(): ReactElement {
  return (
    <section className="p-4">
      <h1 className="mb-4 text-lg font-semibold">使用者列表</h1>
      <div className="alert alert-info" role="status">
        <span>已登入。使用者列表將於後續完成。</span>
      </div>
    </section>
  );
}
