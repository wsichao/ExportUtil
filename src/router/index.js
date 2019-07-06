import Main from '@/components/Main'
// import Query from '@/components/Query'//映射到src文件夹目录

let routes = [
  {
    path: '/',//地址栏  http://localhost:8080/#/  中的最后一个斜杠匹配Main组件，即使不加这个“/”，系统也会自动加
    component: Main,
    name: 'Main' // name需要保持唯一,通过router.push({name:'Login'})方式切换路由
  },
];

export default routes;