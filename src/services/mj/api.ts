// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取当前的用户 GET /mj/admin/current */
export async function currentUser(options?: { [key: string]: any }) {
  return request<API.CurrentUser>('/mj/admin/current', {
    method: 'GET',
    ...(options || {}),
  }).then((response) => {
    if (response && response.apiSecret) {
      localStorage.setItem('mj-api-secret', response.apiSecret);
    }
    return response;
  });
}

/** 退出登录接口 POST /mj/admin/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return request<API.ReturnMessage>('/mj/admin/logout', {
    method: 'POST',
    ...(options || {}),
  }).then((response) => {
    localStorage.removeItem('mj-api-secret');
    return response;
  });
}

/** 登录接口 POST /mj/admin/login */
export async function login(body: API.LoginParams, options?: { [key: string]: any }) {
  return request<API.LoginResult>('/mj/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
/**  MJ 接口 */

/**  POST /mj/account/create */
export async function createAccount(data: object, options?: { [key: string]: any }) {
  return request<API.ReturnMessage>('/mj/account/create', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

/**  POST /mj/account/query */
export async function queryAccount(data: object, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/mj/account/query', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

/**  POST /mj/account/{id}/sync-info */
export async function refreshAccount(id: string, options?: { [key: string]: any }) {
  return request<API.ReturnMessage>(`/mj/account/${id}/sync-info`, {
    method: 'POST',
    ...(options || {}),
  });
}

/**  PUT /mj/account/{id}/update-reconnect */
export async function updateAndReconnect(
  id: string,
  data: object,
  options?: { [key: string]: any },
) {
  return request<API.ReturnMessage>(`/mj/account/${id}/update-reconnect`, {
    method: 'PUT',
    data: data,
    ...(options || {}),
  });
}

/**  DELETE /mj/account/{id}/delete */
export async function deleteAccount(id: string, options?: { [key: string]: any }) {
  return request<API.ReturnMessage>(`/mj/account/${id}/delete`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

export async function queryTask(data: object, options?: { [key: string]: any }) {
  return request<Record<string, any>>('/mj/task-admin/query', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}
