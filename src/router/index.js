import { createRouter, createWebHistory } from 'vue-router'
import { onAuthStateChanged } from 'firebase/auth'
import { useFirebaseAuth } from 'vuefire'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/propiedades/:id',
      name: 'propiedad',
      component: () => import('../views/PropiedadView.vue')
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue')
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/admin/AdminLayout.vue'),
      //meta: { requiresAuth: true }: DEFINE QUE ES NECESARIO QUE EL USUARIO ESTE LOGIADO PARA ENTRAR A ESTAS RUTAS
      meta: { requiresAuth: true },
      // son path que nacen de admin por ende si el admin es necesario estar logiado en las path hijas tambien
      children: [
        {
          path: 'propiedades',
          name: 'admin-propiedades',
          component: () => import('../views/admin/AdminView.vue'),
        },
        {
          path: 'nueva',
          name: 'nueva-propiedad',
          component: () => import('../views/admin/NuevaPropiedadView.vue'),
        },
        {
          path: 'editar/:id',
          name: 'editar-propiedad',
          component: () => import('../views/admin/EditarPropiedadView.vue'),
        },
      ]
    }
  ]
}) 

// Guardar de navegación
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(url => url.meta.requiresAuth)
  if(requiresAuth) {
    // Comprobar que el usuario este autenticado
    try {
      await authenticateUser()
      next()
    } catch (error) {
      console.log(error)
      next({name: 'login'})
    }
  } else {
    // No esta protegido, mostramos la vista
    next()
  }
})

//VERIFICAR SI EL USUARIO SE ENCUENTRA AUTENTICADO
function authenticateUser() {
  const auth = useFirebaseAuth();
  //resolve: se cumplio la promesa
  //reject: di un error
  return new Promise((resolve, reject) => {
    //unsubscribe = verifica si el usuario esta autentificado y al terminar deja de escuchar cambios 
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      if(user) {
        resolve(user)
      } else {
        reject()
      }
    })
  })
}

export default router
