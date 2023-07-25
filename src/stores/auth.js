import { ref, computed, onMounted } from 'vue'
import { defineStore} from 'pinia'
import { useFirebaseAuth} from 'vuefire'
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth'
import { useRouter } from 'vue-router'

//AUTENTICACION CON FIREBASE UTILIZANDO vuefire
//DOCUMENTACION OFICIAL https://firebase.google.com/docs/auth/web/password-auth?hl=es-419
export const useAuthStore = defineStore('auth', () => {
    //intanciamos la libreria de autentificacion adaptada para vue (vuefire)
    //const auth = useFirebaseAuth() remplaza la definida por la documentacion const auth = getAuth(); ya que useFirebaseAuth esta adaptada para ser utilizada en vue
    const auth = useFirebaseAuth()

    const authUser = ref(null)
    const router = useRouter()

    const errorMsg = ref('')
    const errorCodes = {
        'auth/user-not-found' : 'Usuario no encontrado',
        'auth/wrong-password' : 'El password es incorrecto'
    }


    onMounted(() => {
        //DOCUMENTACION OFICIAL DE onAuthStateChanged  https://firebase.google.com/docs/auth/web/manage-users?hl=es-419
        //Obtenemos al usuario con sesion activa
        //params:auth definido, user: parametro por defecto
        onAuthStateChanged(auth, (user) => {
            if(user) {
                authUser.value = user
            }
        })
    })


    const login = ({email, password}) => {
        //params = email:email definido en formularo, password: definido en formulario
        //try:
            //Realizamos un login en firebase en la cual guardamos los datos del usuario logiado en el state authUser
            // y redireccionamos a a la ruta von nombre admin-propiedades
        //catch:
            //se muestra por consola el mensaje de error los cuales fueron redefinidos en el objeto errorCodes
        signInWithEmailAndPassword(auth, email, password)
            .then( (userCredential) => {
                const user = userCredential.user
                authUser.value = user
                router.push({name: 'admin-propiedades'})
            })
            .catch(error => {
                console.log(error)
                errorMsg.value = errorCodes[error.code]
            })
    }

    
    const logout = () => {
        //params: auth definido 
        //eliminamos los datos del usuario logiado del  state authUser
        //redirigimos a la ruta con nombre login
        signOut(auth).then( () => {
            authUser.value = null
            router.push({name: 'login'})
        }).catch( error => {
            console.log(error)
        })
    }

    const hasError = computed(() => {
        return errorMsg.value 
    })

    const isAuth = computed(() => {
        return authUser.value
    })

    return {
        login,
        logout, 
        hasError,
        errorMsg,
        isAuth
    }
})