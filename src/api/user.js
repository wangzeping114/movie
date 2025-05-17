import request from '@/utils/request'

export function login(data) {
  return request.post('/api/login', data)
}

export function register(data) {
  return request.post('/api/register', data)
}