export type UserStatus = 'active' | 'inactive';

export type User = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: string;
  createdAt: string;
};

export type UsersPagination = {
  total: number;
  currentPage: number;
  perPage: number;
  totalPages: number;
};

export type UsersResult = {
  users: User[];
  pagination: UsersPagination;
};

export type UsersQueryParams = {
  page: number;
  limit: number;
  name: string | undefined;
  email: string | undefined;
  status: UserStatus | undefined;
};

export type UsersApiUser = {
  id: number;
  name: string;
  email: string;
  avatar: string;
  status: string;
  created_at: string;
};

export type UsersApiPagination = {
  total: number;
  current_page: number;
  per_page: number;
  total_pages: number;
};

export type UsersApiResponse = {
  data: UsersApiUser[];
  pagination: UsersApiPagination;
};
