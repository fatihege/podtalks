import styles from '@/styles/side-panel.module.sass'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {useContext} from 'react'
import {AuthContext} from '@/contexts/auth'

export default function SidePanel() {
    const router = useRouter()
    const [user] = useContext(AuthContext)

    return (
        <div className={styles.sidePanel}>
            <div className={styles.links}>
                <Link href={'/'} className={router.asPath === '/' ? styles.active : ''}>
                    Anasayfa
                </Link>
                <Link href={'/explore'} className={router.asPath === '/explore' ? styles.active : ''}>
                    Keşfet
                </Link>
            </div>
            <div className={styles.followingSection}>
                <h3>Takip ettikleriniz</h3>
                <div className={styles.following}>
                    {user.loaded && user?.id && user?.token ? (
                        <span className={styles.noOne}>Takip ettiğiniz bir podcaster yok.</span>
                    ) : user.loaded && (!user?.id || !user?.token) ? (
                        <span className={styles.noOne}>Takip etmek için <Link href={'/login'}>giriş yapın</Link>.</span>
                    ) : ''}
                </div>
            </div>
        </div>
    )
}