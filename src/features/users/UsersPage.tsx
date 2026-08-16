import { AppError } from '@/shared/api/error-type';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactElement } from 'react';
import { useSearchParams } from 'react-router';
import type { User, UserStatus, UsersQueryParams } from './types';
import { useUsersQuery } from './use-users-query';
import {
  DEFAULT_PAGE,
  LIMIT_OPTIONS,
  parseUsersSearchParams,
  serializeUsersSearchParams,
} from './utils/parse-users-search-params';

const columnHelper = createColumnHelper<User>();

const dateFormatter = new Intl.DateTimeFormat('zh-TW', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatCreatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateFormatter.format(date);
}

function isRetryableUsersError(error: AppError): boolean {
  if (error.code === 'NETWORK') {
    return true;
  }
  return error.status !== undefined && error.status >= 500;
}

function limitSelectOptions(current: number): number[] {
  if ((LIMIT_OPTIONS as readonly number[]).includes(current)) {
    return [...LIMIT_OPTIONS];
  }
  return [...LIMIT_OPTIONS, current].sort((left: number, right: number) => left - right);
}

function UserAvatar({ name, src }: { name: string; src: string }): ReactElement {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = src.length === 0 || failed;

  if (showPlaceholder) {
    const initial = name.trim().slice(0, 1);
    return (
      <div className="avatar avatar-placeholder">
        <div className="w-10 rounded-full bg-neutral text-neutral-content">
          <span>{initial.length > 0 ? initial : '？'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="avatar">
      <div className="w-10 rounded-full">
        <img alt={`${name} 的頭像`} src={src} onError={() => setFailed(true)} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }): ReactElement {
  if (status === 'active') {
    return <span className="badge badge-success">啟用</span>;
  }
  if (status === 'inactive') {
    return <span className="badge badge-ghost">停用</span>;
  }
  return <span className="badge badge-ghost">{status}</span>;
}

const columns = [
  columnHelper.accessor('name', {
    header: '姓名',
    enableSorting: false,
    cell: (info) => (
      <div className="flex min-w-0 items-center gap-3">
        <UserAvatar name={info.row.original.name} src={info.row.original.avatar} />
        <span className="min-w-0 truncate">{info.getValue()}</span>
      </div>
    ),
  }),
  columnHelper.accessor('email', {
    header: '電子郵件',
    enableSorting: false,
    cell: (info) => <span className="min-w-0 truncate">{info.getValue()}</span>,
  }),
  columnHelper.accessor('status', {
    header: '狀態',
    enableSorting: false,
    cell: (info) => <StatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor('createdAt', {
    header: '建立時間',
    enableSorting: false,
    cell: (info) => <time>{formatCreatedAt(info.getValue())}</time>,
  }),
];

const SKELETON_ROWS = [
  {
    nameClass: 'skeleton h-4 w-24',
    emailClass: 'skeleton h-4 w-48',
    cardEmailClass: 'skeleton h-3 w-48',
  },
  {
    nameClass: 'skeleton h-4 w-20',
    emailClass: 'skeleton h-4 w-40',
    cardEmailClass: 'skeleton h-3 w-40',
  },
  {
    nameClass: 'skeleton h-4 w-28',
    emailClass: 'skeleton h-4 w-52',
    cardEmailClass: 'skeleton h-3 w-52',
  },
  {
    nameClass: 'skeleton h-4 w-16',
    emailClass: 'skeleton h-4 w-36',
    cardEmailClass: 'skeleton h-3 w-36',
  },
  {
    nameClass: 'skeleton h-4 w-24',
    emailClass: 'skeleton h-4 w-44',
    cardEmailClass: 'skeleton h-3 w-44',
  },
] as const;

type SkeletonRow = (typeof SKELETON_ROWS)[number];

function UsersTableSkeleton(): ReactElement {
  return (
    <div className="hidden min-w-0 overflow-x-auto md:block" aria-hidden="true">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">姓名</th>
            <th scope="col">電子郵件</th>
            <th scope="col">狀態</th>
            <th scope="col">建立時間</th>
          </tr>
        </thead>
        <tbody>
          {SKELETON_ROWS.map((row: SkeletonRow, index: number) => (
            <tr key={`users-table-skeleton-${String(index)}`}>
              <td className="max-w-xs min-w-0">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-10 w-10 shrink-0 skeleton rounded-full" />
                  <div className={row.nameClass} />
                </div>
              </td>
              <td className="max-w-xs min-w-0">
                <div className={row.emailClass} />
              </td>
              <td className="max-w-xs min-w-0">
                <div className="h-6 w-12 skeleton rounded-full" />
              </td>
              <td className="max-w-xs min-w-0">
                <div className="h-4 w-32 skeleton" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersCardsSkeleton(): ReactElement {
  return (
    <ul className="flex flex-col gap-3 md:hidden" aria-hidden="true">
      {SKELETON_ROWS.map((row: SkeletonRow, index: number) => (
        <li key={`users-card-skeleton-${String(index)}`}>
          <article className="card bg-base-100 shadow">
            <div className="card-body min-w-0">
              <div className="flex min-w-0 items-center gap-3">
                <div className="h-10 w-10 shrink-0 skeleton rounded-full" />
                <div className="flex min-w-0 flex-col gap-2">
                  <div className={row.nameClass} />
                  <div className={row.cardEmailClass} />
                </div>
              </div>
              <div className="card-actions items-center justify-between">
                <div className="h-6 w-12 skeleton rounded-full" />
                <div className="h-4 w-28 skeleton" />
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

function UsersSkeleton(): ReactElement {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">載入使用者列表中</span>
      <UsersTableSkeleton />
      <UsersCardsSkeleton />
    </div>
  );
}

function UsersCards({ users }: { users: User[] }): ReactElement {
  return (
    <ul className="flex flex-col gap-3 md:hidden">
      {users.map((user) => (
        <li key={user.id}>
          <article className="card bg-base-100 shadow">
            <div className="card-body min-w-0">
              <div className="flex min-w-0 items-center gap-3">
                <UserAvatar name={user.name} src={user.avatar} />
                <div className="min-w-0">
                  <h2 className="card-title truncate text-base">{user.name}</h2>
                  <p className="truncate text-sm break-all">{user.email}</p>
                </div>
              </div>
              <div className="card-actions items-center justify-between">
                <StatusBadge status={user.status} />
                <time className="text-sm">{formatCreatedAt(user.createdAt)}</time>
              </div>
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

/**
 * 受保護的使用者列表：URL 為篩選與分頁的唯一來源。
 */
export function UsersPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const params = parseUsersSearchParams(searchParams);
  const canonicalQuery = serializeUsersSearchParams(params).toString();
  const [draftName, setDraftName] = useState(params.name ?? '');
  const [draftEmail, setDraftEmail] = useState(params.email ?? '');
  const [draftStatus, setDraftStatus] = useState(params.status ?? '');

  useEffect(() => {
    if (searchParams.toString() !== canonicalQuery) {
      setSearchParams(canonicalQuery, { replace: true });
    }
  }, [canonicalQuery, searchParams, setSearchParams]);

  useEffect(() => {
    setDraftName(params.name ?? '');
    setDraftEmail(params.email ?? '');
    setDraftStatus(params.status ?? '');
  }, [params.name, params.email, params.status]);

  const query = useUsersQuery(params);
  const users = query.data?.users ?? [];
  const pagination = query.data?.pagination;
  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination?.totalPages ?? 0,
    state: {
      pagination: {
        pageIndex: params.page - 1,
        pageSize: params.limit,
      },
    },
  });

  function writeParams(next: UsersQueryParams, replace: boolean): void {
    setSearchParams(serializeUsersSearchParams(next), { replace });
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    const status: UserStatus | undefined =
      draftStatus === 'active' || draftStatus === 'inactive' ? draftStatus : undefined;
    writeParams(
      {
        page: DEFAULT_PAGE,
        limit: params.limit,
        name: draftName.trim() === '' ? undefined : draftName.trim(),
        email: draftEmail.trim() === '' ? undefined : draftEmail.trim(),
        status,
      },
      false,
    );
  }

  function handleFilterReset(): void {
    setDraftName('');
    setDraftEmail('');
    setDraftStatus('');
    writeParams(
      {
        page: DEFAULT_PAGE,
        limit: params.limit,
        name: undefined,
        email: undefined,
        status: undefined,
      },
      false,
    );
  }

  function handleLimitChange(event: ChangeEvent<HTMLSelectElement>): void {
    writeParams(
      {
        ...params,
        page: DEFAULT_PAGE,
        limit: Number.parseInt(event.target.value, 10),
      },
      false,
    );
  }

  function goToPage(page: number): void {
    writeParams({ ...params, page }, false);
  }

  const totalPages = pagination?.totalPages ?? 0;
  const canGoPrevious = params.page > 1;
  const canGoNext = !query.isPlaceholderData && totalPages > 0 && params.page < totalPages;
  const showInitialLoading = query.isPending && query.data === undefined;
  const error = query.error;

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-4 p-4">
      <div className="flex min-w-0 items-center justify-between gap-3">
        <h1 className="text-lg font-semibold">使用者列表</h1>
        {query.isFetching && query.isPlaceholderData ? (
          <span className="loading loading-spinner" aria-label="更新中" />
        ) : null}
      </div>

      <form className="card bg-base-100 shadow" onSubmit={handleFilterSubmit}>
        <div className="card-body min-w-0">
          <fieldset className="fieldset min-w-0">
            <legend className="fieldset-legend">篩選</legend>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              <div className="min-w-0">
                <label className="label" htmlFor="users-filter-name">
                  姓名
                </label>
                <input
                  id="users-filter-name"
                  className="input w-full"
                  name="name"
                  value={draftName}
                  onChange={(event) => setDraftName(event.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="min-w-0">
                <label className="label" htmlFor="users-filter-email">
                  電子郵件
                </label>
                <input
                  id="users-filter-email"
                  className="input w-full"
                  name="email"
                  type="text"
                  value={draftEmail}
                  onChange={(event) => setDraftEmail(event.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="min-w-0">
                <label className="label" htmlFor="users-filter-status">
                  狀態
                </label>
                <select
                  id="users-filter-status"
                  className="select w-full"
                  name="status"
                  value={draftStatus}
                  onChange={(event) => setDraftStatus(event.target.value)}
                >
                  <option value="">全部</option>
                  <option value="active">啟用</option>
                  <option value="inactive">停用</option>
                </select>
              </div>
              <div className="flex min-w-0 items-end gap-2">
                <button className="btn btn-neutral" type="submit">
                  套用
                </button>
                <button className="btn" type="button" onClick={handleFilterReset}>
                  清除
                </button>
              </div>
            </div>
          </fieldset>
        </div>
      </form>

      {showInitialLoading ? <UsersSkeleton /> : null}

      {error !== null ? (
        <div className="alert alert-error" role="alert">
          <span>{error.message}</span>
          {isRetryableUsersError(error) ? (
            <button className="btn btn-sm" type="button" onClick={() => void query.refetch()}>
              重試
            </button>
          ) : null}
        </div>
      ) : null}

      {!showInitialLoading && error === null && users.length === 0 ? (
        <div className="alert" role="status">
          <span>沒有符合條件的使用者。</span>
        </div>
      ) : null}

      {!showInitialLoading && users.length > 0 ? (
        <>
          <div className="hidden min-w-0 overflow-x-auto md:block">
            <table className="table">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} scope="col">
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="max-w-xs min-w-0">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <UsersCards users={users} />
        </>
      ) : null}

      {pagination !== undefined && error === null ? (
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex min-w-0 items-center gap-2">
            <span className="label">每頁筆數</span>
            <select
              className="select"
              aria-label="每頁筆數"
              value={params.limit}
              onChange={handleLimitChange}
            >
              {limitSelectOptions(params.limit).map((limit) => (
                <option key={limit} value={limit}>
                  {limit}
                </option>
              ))}
            </select>
            <span className="text-sm">共 {pagination.total} 筆</span>
          </label>
          <div className="join">
            <button
              className="btn join-item"
              type="button"
              aria-label="上一頁"
              disabled={!canGoPrevious}
              onClick={() => goToPage(params.page - 1)}
            >
              上一頁
            </button>
            <span className="btn btn-active join-item" aria-current="page">
              第 {params.page} / {Math.max(totalPages, 1)} 頁
            </span>
            <button
              className="btn join-item"
              type="button"
              aria-label="下一頁"
              disabled={!canGoNext}
              onClick={() => goToPage(params.page + 1)}
            >
              下一頁
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
