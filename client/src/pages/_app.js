import '@/styles/globals.sass'
import {AuthProvider} from '@/contexts/auth'
import {AlertProvider} from '@/contexts/alert'
import {NavigationBarProvider} from '@/contexts/navigation-bar'
import Main from '@/components/main'

export default function App({Component, pageProps}) {
    return (
        <AuthProvider>
            <AlertProvider>
                <NavigationBarProvider>
                    <Main>
                        <Component {...pageProps} />
                    </Main>
                </NavigationBarProvider>
            </AlertProvider>
        </AuthProvider>
    )
}
