import '@/styles/globals.sass'
import {AuthProvider} from '@/contexts/auth'
import {AlertProvider} from '@/contexts/alert'
import {NavigationBarProvider} from '@/contexts/navigation-bar'
import Main from '@/components/main'
import {SidePanelProvider} from '@/contexts/side-panel'

export default function App({Component, pageProps}) {
    return (
        <AuthProvider>
            <AlertProvider>
                <SidePanelProvider>
                    <NavigationBarProvider>
                        <Main>
                            <Component {...pageProps} />
                        </Main>
                    </NavigationBarProvider>
                </SidePanelProvider>
            </AlertProvider>
        </AuthProvider>
    )
}
