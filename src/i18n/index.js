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
    register: '注册',
    save: '保存',
    cancel: '取消',
    confirm: '确认',
    edit: '编辑',
    delete: '删除',
    search: '搜索',
    loading: '加载中...',
    noData: '暂无数据',
    viewCount: '{count}次观看',
    likesCount: '{count}人点赞',
    commentsCount: '{count}条评论',
    shareCount: '{count}次分享'
  },
  login: {
    title: '登录',
    username: '用户名',
    password: '密码',
    loginButton: '登录',
    noAccount: '还没有账号？',
    register: '立即注册',
    forgotPassword: '忘记密码？'
  },
  profile: {
    works: '作品',
    likes: '喜欢',
    followers: '粉丝',
    following: '关注',
    editProfile: '编辑资料',
    settings: '设置',
    accountSettings: '账号设置',
    privacySettings: '隐私设置',
    notificationSettings: '通知设置',
    changeAvatar: '更换头像',
    logout: '退出登录',
    bio: '个人简介'
  },
  publish: {
    title: '发布作品',
    videoTitle: '视频标题',
    description: '添加描述...',
    tags: '添加标签',
    cover: '选择封面',
    selectVideo: '选择视频',
    uploadButton: '上传',
    dragHint: '拖放文件到此处或点击上传',
    uploading: '上传中...',
    uploadSuccess: '上传成功',
    uploadFailed: '上传失败',
    publishButton: '发布'
  },
  live: {
    title: '直播',
    online: '直播中',
    offline: '未开播',
    viewers: '{count}人观看',
    startLive: '我要开播',
    liveTitle: '直播标题',
    selectCover: '选择封面',
    startButton: '开始直播'
  },
  messages: {
    title: '消息',
    noMessages: '暂无消息',
    sendMessage: '发送消息...'
  },
  settings: {
    title: '设置',
    darkMode: '深色模式',
    language: '语言',
    notification: '通知',
    privacy: '隐私',
    account: '账号',
    about: '关于我们',
    feedback: '反馈建议',
    help: '帮助中心'
  }
}

// 英文语言包
const enUS = {
  common: {
    home: 'Home',
    live: 'Live',
    publish: 'Publish',
    messages: 'Messages',
    profile: 'Profile',
    follow: 'Follow',
    followed: 'Following',
    likes: 'Likes',
    comments: 'Comments',
    shares: 'Shares',
    notLoggedIn: 'Not Logged In',
    login: 'Login',
    logout: 'Logout',
    register: 'Register',
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    edit: 'Edit',
    delete: 'Delete',
    search: 'Search',
    loading: 'Loading...',
    noData: 'No Data',
    viewCount: '{count} views',
    likesCount: '{count} likes',
    commentsCount: '{count} comments',
    shareCount: '{count} shares'
  },
  login: {
    title: 'Login',
    username: 'Username',
    password: 'Password',
    loginButton: 'Login',
    noAccount: 'No account yet?',
    register: 'Register Now',
    forgotPassword: 'Forgot Password?'
  },
  profile: {
    works: 'Works',
    likes: 'Likes',
    followers: 'Followers',
    following: 'Following',
    editProfile: 'Edit Profile',
    settings: 'Settings',
    accountSettings: 'Account Settings',
    privacySettings: 'Privacy Settings',
    notificationSettings: 'Notification Settings',
    changeAvatar: 'Change Avatar',
    logout: 'Logout',
    bio: 'Bio'
  },
  publish: {
    title: 'Publish',
    videoTitle: 'Video Title',
    description: 'Add description...',
    tags: 'Add tags',
    cover: 'Select Cover',
    selectVideo: 'Select Video',
    uploadButton: 'Upload',
    dragHint: 'Drag files here or click to upload',
    uploading: 'Uploading...',
    uploadSuccess: 'Upload Success',
    uploadFailed: 'Upload Failed',
    publishButton: 'Publish'
  },
  live: {
    title: 'Live',
    online: 'Live',
    offline: 'Offline',
    viewers: '{count} viewers',
    startLive: 'Start Live',
    liveTitle: 'Live Title',
    selectCover: 'Select Cover',
    startButton: 'Start Streaming'
  },
  messages: {
    title: 'Messages',
    noMessages: 'No Messages',
    sendMessage: 'Send message...'
  },
  settings: {
    title: 'Settings',
    darkMode: 'Dark Mode',
    language: 'Language',
    notification: 'Notification',
    privacy: 'Privacy',
    account: 'Account',
    about: 'About Us',
    feedback: 'Feedback',
    help: 'Help Center'
  }
}

const i18n = createI18n({
  legacy: false, // 使用组合式API
  locale: localStorage.getItem('locale') || 'zh-CN', // 获取本地存储的语言设置或默认为中文
  fallbackLocale: 'zh-CN', // 回退语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS
  }
})

// 导出切换语言的方法
export const setLanguage = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('locale', locale)
  document.querySelector('html').setAttribute('lang', locale)
}

export default i18n 