import styles from '@/styles/navbar.module.sass'
import Logo from '@/icons/logo'
import Link from 'next/link'
import Search from '@/icons/search'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import DefaultProfile from '@/icons/default-profile'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import {SidePanelContext} from '@/contexts/side-panel'

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useContext(AuthContext)
    const [menuRef, showMenu, setShowMenu] = useContext(NavigationBarContext)
    const [showMobileMenu, setShowMobileMenu] = useContext(SidePanelContext)
    const search = useRef('')
    const [width, setWidth] = useState(null)

    useEffect(() => {
        window.addEventListener('resize', () => setWidth(window.innerWidth))
        setWidth(window.innerWidth)

        return () => window.removeEventListener('resize', () => setWidth(window.innerWidth))
    }, [])

    const handleShowMenu = () => setShowMenu(!showMenu.current)

    const handleShowMobileMenu = () => setShowMobileMenu(!showMobileMenu)

    const handleLogout = () => {
        localStorage.removeItem('token')
        setUser({loaded: true})
        setShowMenu(false)
        router.reload()
    }

    const handleSearch = () => {
        if (search.current?.value?.length > 0) router.push(`/search/${search.current?.value}`)
    }
    const isUserStreaming = () => user?.stream && user?.stream?.title?.trim().length && user?.stream?.subject?.trim().length

    return (
        <div className={styles.navbar}>
            <div className={styles.left}>
                {width > 456 ? (
                    <div className={styles.logo}>
                        <Link href={'/'}>
                            <Logo/>
                        </Link>
                    </div>
                ) : (
                    <div className={styles.hamburger}>
                        <button onClick={() => handleShowMobileMenu()}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </button>
                    </div>
                )}
                <div className={styles.links}>
                    <Link href={user.loaded && user?.id && user?.token ? '/following' : '/login'}
                          className={router.asPath === '/following' ? styles.active : ''}>
                        Takip Edilenler
                    </Link>
                </div>
            </div>
            {width > 470 && (
                <div className={styles.searchBox}>
                    <div className={styles.searchInput}>
                        <input type="text" placeholder="Podcaster, makale veya kitap ara" ref={search} onKeyDown={e => {
                            if (e.key === 'Enter') handleSearch()
                        }}/>
                        <button onClick={() => handleSearch()}>
                            <Search stroke={'#1c1c1c'}/>
                        </button>
                    </div>
                </div>
            )}
            <div className={styles.account}>
                {user.loaded && !router.asPath.startsWith('/stream') ? (
                    <div className={styles.startStreamButton}>
                        <button onClick={() =>
                            user.loaded && user?.id && user?.token ?
                                (isUserStreaming() ?
                                    router.push('/stream') :
                                    router.push('/start-stream')) :
                                router.push('/login')}>
                            {isUserStreaming() ? 'Yayınına dön' : 'Podcast yayını aç'}
                        </button>
                    </div>
                ) : ''}
                {user.loaded && user?.id ? (
                    <div className={`${styles.profile} ${showMenu.current ? styles.active : ''}`}
                         onClick={() => handleShowMenu()}>
                        <div className={styles.userName}>{user?.name}</div>
                        <div className={styles.profileImage}>
                            {user?.image ? <img src={`${process.env.CDN_URL}/${user.image}`} alt={user?.name}/> :
                                <DefaultProfile/>}
                        </div>
                        <div className={`${styles.menu} ${showMenu.current ? styles.show : ''}`} ref={menuRef}>
                            <ul>
                                {width <= 1180 && !router.asPath.startsWith('/stream') && (
                                    <li>
                                        <Link href={isUserStreaming() ? '/stream' : '/start-stream'}>
                                            {isUserStreaming() ? 'Yayınına dön' : 'Podcast yayını aç'}
                                        </Link>
                                    </li>
                                )}
                                <li>
                                    <Link href={'/profile/[id]'} as={`/profile/${user.id}`}>Profil</Link>
                                </li>
                                <li>
                                    <Link href={'/account'}>Hesap</Link>
                                </li>
                                <li className={styles.separator}></li>
                                <li>
                                    <span onClick={handleLogout}>Çıkış yap</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                ) : user.loaded && !user?.id ? (
                    <div className={styles.links}>
                        <Link href={'/login'} className={router.asPath === '/login' ? styles.active : ''}>
                            Giriş Yap
                        </Link>
                        {width > 650 && (
                            <Link href={'/register'} className={router.asPath === '/register' ? styles.active : ''}>
                                Kayıt Ol
                            </Link>
                        )}
                    </div>
                ) : ''}
            </div>
        </div>
    )
}