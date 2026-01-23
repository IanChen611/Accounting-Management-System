import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: () => import('../views/InvoiceListView.vue'),
    },
    {
      path: '/invoices/create',
      name: 'invoice-create',
      component: () => import('../views/InvoiceCreateView.vue'),
    },
    {
      path: '/invoices/:id/edit',
      name: 'invoice-edit',
      component: () => import('../views/InvoiceEditView.vue'),
    },
    {
      path: '/customers',
      name: 'customers',
      component: () => import('../views/CustomerListView.vue'),
    },
    {
      path: '/mailing-labels',
      name: 'mailing-labels',
      component: () => import('../views/MailingLabelView.vue'),
    },
  ],
})

export default router
