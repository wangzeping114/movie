import { createI18n } from 'vue-i18n'

// 中文语言包
const zhCN = {
  common: {
    home: '首页',
    live: '直播',
    publish: '发布',
    messages: '消息',
    profile: '我的',
    follow: '关注',
    followed: '已关注',
    likes: '点赞',
    comments: '评论',
    shares: '分享',
    notLoggedIn: '未登录',
    login: '登录',
    logout: '退出登录',
    register: '注册'
  },
  login: {
    title: '登录',
    welcomeBack: '欢迎回来',
    welcomeJoin: '欢迎加入我们',
    username: '用户名',
    password: '密码',
    confirmPassword: '确认密码',
    submit: '提交',
    noAccount: '还没有账号？',
    haveAccount: '已有账号？',
    switchToRegister: '立即注册',
    switchToLogin: '立即登录',
    passwordMismatch: '两次输入的密码不一致',
    loginSuccess: '登录成功',
    registerSuccess: '注册成功',
    error: '操作失败，请重试'
  }
}

const i18n = createI18n({
  legacy: false,
  locale: 'zh-CN',
  fallbackLocale: 'zh-CN',
  messages: {
    'zh-CN': zhCN
  }
})

// 添加切换语言的方法
export const setLanguage = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.querySelector('html').setAttribute('lang', locale)
}

export default i18n 