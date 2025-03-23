<template>
  <div class="login-container">
    <div class="login-box">
      <h2>{{ isLogin ? '登录' : '注册' }}</h2>
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <input 
            type="text" 
            v-model="form.username" 
            placeholder="用户名"
            required
          >
        </div>
        <div class="form-group">
          <input 
            type="password" 
            v-model="form.password" 
            placeholder="密码"
            required
          >
        </div>
        <div class="form-group" v-if="!isLogin">
          <input 
            type="password" 
            v-model="form.confirmPassword" 
            placeholder="确认密码"
            required
          >
        </div>
        <button type="submit">{{ isLogin ? '登录' : '注册' }}</button>
      </form>
      <p class="switch-mode" @click="isLogin = !isLogin">
        {{ isLogin ? '没有账号？去注册' : '已有账号？去登录' }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLogin = ref(true)

const form = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const handleSubmit = () => {
  if (!isLogin.value && form.password !== form.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }

  // 这里应该调用后端API进行登录/注册
  // 模拟登录成功
  localStorage.setItem('user', JSON.stringify({
    username: form.username,
    isLoggedIn: true
  }))
  
  // 获取来源页面，如果没有则返回短视频页面
  const from = router.currentRoute.value.query.from || '/short-video'
  router.push(from)
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-box {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
}

.form-group {
  margin-bottom: 1rem;
}

input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.8rem;
  background-color: #ff4d4f;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

button:hover {
  background-color: #ff7875;
}

.switch-mode {
  text-align: center;
  margin-top: 1rem;
  color: #ff4d4f;
  cursor: pointer;
}

.switch-mode:hover {
  text-decoration: underline;
}
</style> 