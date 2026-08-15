import { useEffect, useState, type ReactElement } from 'react';
import { createPortal } from 'react-dom';
import type { AppError } from '@/shared/api/error-type';
import { bootstrapSession } from '@/features/auth/utils/bootstrap-session';
import { useAuthStore } from '@/features/auth/auth-store';
import { usePendingRequestCount } from '@/shared/api/pending-requests';
import { AppLayout } from './AppLayout';
import { AppRoutes } from './routes';

function ApiLoadingMask(): ReactElement | null {
  const pendingCount = usePendingRequestCount();
  if (pendingCount === 0) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center rounded-none border-0 glass"
      role="status"
      aria-live="polite"
      aria-label="載入中"
    >
      <span className="loading loading-xl loading-infinity" />
    </div>,
    document.body,
  );
}

function SessionRetry({ error }: { error: AppError }): ReactElement {
  const [pending, setPending] = useState(false);

  async function handleRetry(): Promise<void> {
    setPending(true);
    try {
      await bootstrapSession();
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="hero flex-1">
      <div className="hero-content w-full">
        <section className="card w-full max-w-sm bg-base-100 shadow-2xl">
          <div className="card-body">
            <h1 className="card-title">無法恢復登入狀態</h1>
            <div className="alert alert-error" role="alert">
              <span>{error.message}</span>
            </div>
            <div className="card-actions justify-end">
              <button
                className="btn btn-neutral"
                type="button"
                disabled={pending}
                onClick={() => void handleRetry()}
              >
                重試
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function AppContent(): ReactElement {
  const session = useAuthStore((state) => state.session);

  useEffect(() => {
    function onHydrated(): void {
      void bootstrapSession();
    }

    if (useAuthStore.persist.hasHydrated()) {
      onHydrated();
    }

    return useAuthStore.persist.onFinishHydration(onHydrated);
  }, []);

  if (session.status === 'ERROR') {
    return <SessionRetry error={session.error} />;
  }

  return <AppRoutes />;
}

function withAppLayout(Page: () => ReactElement): () => ReactElement {
  return function PageWithLayout(): ReactElement {
    return (
      <AppLayout>
        <Page />
      </AppLayout>
    );
  };
}

const AppWithLayout = withAppLayout(AppContent);

/**
 * 根元件：先套 layout，再恢復 session 並進入路由。API 進行中以遮罩覆蓋整個畫面。
 */
export function App(): ReactElement {
  return (
    <>
      <AppWithLayout />
      <ApiLoadingMask />
    </>
  );
}
