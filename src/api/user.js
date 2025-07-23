import request from '@/utils/request'

export function login(data) {
  return request.post('/api/user/login', data)
}

export function register(data) {
  return request.post('/api/user/register', data)
}