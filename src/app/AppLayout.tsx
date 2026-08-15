import { useAuthStore } from '@/features/auth/auth-store';
import type { AuthUser } from '@/features/auth/types/session';
import { logout } from '@/features/auth/utils/auth-actions';
import { ThemeToggle } from '@/shared/ui/ThemeToggle';
import { useRef, type CSSProperties, type ReactElement, type ReactNode } from 'react';
import userAvatar from '../../public/6a0cc7245fa6fc504bca6b7bc9545cb0.jpg';

type AppLayoutProps = {
  children: ReactNode;
};

type UserMenuProps = {
  user: AuthUser | null;
};

const USER_MENU_ID = 'user-menu';
const USER_MENU_ANCHOR = '--user-menu';
const userMenuAnchorStyle = { anchorName: USER_MENU_ANCHOR } as CSSProperties;
const userMenuPositionStyle = { positionAnchor: USER_MENU_ANCHOR } as CSSProperties;

function PlaceholderMark(): ReactElement {
  return <span className="text-xl">？</span>;
}

function UserMenu({ user }: UserMenuProps): ReactElement {
  const menuRef = useRef<HTMLDivElement>(null);

  function handleLogout(): void {
    menuRef.current?.hidePopover();
    logout();
  }

  return (
    <>
      <button
        type="button"
        className="btn btn-circle btn-ghost"
        popoverTarget={USER_MENU_ID}
        style={userMenuAnchorStyle}
        aria-label="開啟使用者選單"
      >
        {user === null ? (
          <div className="avatar avatar-placeholder">
            <div className="w-10 rounded-full bg-neutral text-neutral-content">
              <PlaceholderMark />
            </div>
          </div>
        ) : (
          <div className="avatar-online avatar">
            <div className="w-10 rounded-full">
              <img alt={`${user.username} 的頭像`} src={userAvatar} />
            </div>
          </div>
        )}
      </button>
      <div
        ref={menuRef}
        id={USER_MENU_ID}
        popover="auto"
        className="dropdown dropdown-end mt-2 w-72 rounded-lg border border-blue-300 bg-base-100 p-3 shadow-2xl"
        style={userMenuPositionStyle}
      >
        <div className="flex items-center gap-6">
          {user === null ? (
            <div className="avatar avatar-placeholder">
              <div className="w-20 rounded-full bg-neutral text-neutral-content">
                <PlaceholderMark />
              </div>
            </div>
          ) : (
            <div className="avatar-online avatar">
              <div className="w-20 rounded-full">
                <img alt={`${user.username} 的頭像`} src={userAvatar} />
              </div>
            </div>
          )}
          {user !== null ? (
            <div className="min-w-0">
              <p className="truncate text-xl font-semibold">{user.username}</p>
              <span className="badge badge-ghost">{user.role}</span>
            </div>
          ) : null}
        </div>
        {user !== null ? (
          <button className="btn mt-3 btn-block" type="button" onClick={handleLogout}>
            登出
          </button>
        ) : null}
      </div>
    </>
  );
}

/**
 * 全站 layout。navbar、主題開關只掛一次，換頁不會重跑。
 */
export function AppLayout({ children }: AppLayoutProps): ReactElement {
  const session = useAuthStore((state) => state.session);

  return (
    <div className="flex min-h-dvh flex-col bg-base-200">
      <header className="navbar bg-base-100 shadow-sm">
        <div className="navbar-start">
          <span className="truncate px-2 text-lg font-extrabold">Ionex Frontend Interview</span>
        </div>
        <div className="navbar-end gap-4">
          <UserMenu user={session.status === 'AUTHENTICATED' ? session.user : null} />
          <ThemeToggle />
        </div>
      </header>
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
