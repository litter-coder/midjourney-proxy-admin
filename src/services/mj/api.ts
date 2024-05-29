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
      sessionStorage.setItem('mj-api-secret', response.apiSecret);
    }
    if (response.imagePrefix) {
      sessionStorage.setItem('mj-image-prefix', response.imagePrefix);
    } else {
      sessionStorage.removeItem('mj-image-prefix');
    }
    sessionStorage.setItem('mj-active', response.active?.toString() || 'false');
    return response;
  });
}

/** 退出登录接口 POST /mj/admin/logout */
export async function outLogin(options?: { [key: string]: any }) {
  return request<API.ReturnMessage>('/mj/admin/logout', {
    method: 'POST',
    ...(options || {}),
  }).then((response) => {
    sessionStorage.removeItem('mj-api-secret');
    sessionStorage.removeItem('mj-image-prefix');
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

export async function update(
  id: string,
  data: object,
  options?: { [key: string]: any },
) {
  return request<API.ReturnMessage>(`/mj/account/${id}/update`, {
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

export async function accountChangeVersion(id: string, version: string, options?: { [key: string]: any }) {
  return request<API.ReturnMessage>(`/mj/account/${id}/change-version?version=${version}`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function accountAction(id: string, botType: string, customId: string, options?: { [key: string]: any }) {
  return request<API.ReturnMessage>(`/mj/account/${id}/action?customId=${customId}&botType=${botType}`, {
    method: 'POST',
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

export async function queryTaskByIds(ids: string[], options?: { [key: string]: any }) {
  return request<any>('/mj/task/list-by-ids', {
    method: 'POST',
    data: { ids: ids },
    ...(options || {}),
  });
}

export async function getTask(id: string, options?: { [key: string]: any }) {
  return request<any>(`/mj/task-admin/${id}/fetch`, {
    method: 'GET',
    ...(options || {}),
  });
}

export async function submitTask(action: string, data: object, options?: { [key: string]: any }) {
  return request<any>(`/mj/submit/${action}`, {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

export async function cancelTask(id: string, options?: { [key: string]: any }) {
  return request<API.ReturnMessage>(`/mj/task/${id}/cancel`, {
    method: 'POST',
    ...(options || {}),
  });
}

export async function swapFace(data: object, options?: { [key: string]: any }) {
  return request<any>('/mj/insight-face/swap', {
    method: 'POST',
    data: data,
    ...(options || {}),
  });
}

export async function getMachineCode(options?: { [key: string]: any }) {
  return request<string>('/mj/act/machine', {
    method: 'GET',
    ...(options || {}),
  });
}

export async function activateByCode(code: string, options?: { [key: string]: any }) {
  return request<string>('/mj/act/activate', {
    method: 'POST',
    data: { code: code },
    ...(options || {}),
  });
}

export async function probe(tail: number, options?: { [key: string]: any }) {
  return request<any>('/mj/admin/probe?tail=' + tail, {
    method: 'GET',
    ...(options || {}),
  });
}