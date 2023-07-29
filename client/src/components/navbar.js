import styles from '@/styles/navbar.module.sass'
import Logo from '@/icons/logo'
import Link from 'next/link'
import Search from '@/icons/search'
import {useRouter} from 'next/router'
import {useContext} from 'react'
import {AuthContext} from '@/contexts/auth'
import DefaultProfile from '@/icons/default-profile'
import {NavigationBarContext} from '@/contexts/navigation-bar'
import StartStreamButton from '@/components/start-stream-button'

export default function Navbar() {
    const router = useRouter()
    const [user, setUser] = useContext(AuthContext)
    const [menuRef, showMenu, setShowMenu] = useContext(NavigationBarContext)

    const handleShowMenu = () => setShowMenu(!showMenu.current)

    const handleLogout = () => {
        localStorage.removeItem('token')
        setUser({loaded: true})
        setShowMenu(false)
        // TODO: Remove this if it's not necessary
        router.reload()
    }

    return (
        <div className={styles.navbar}>
            <div className={styles.left}>
                <div className={styles.logo}>
                    <Link href={'/'}>
                        <Logo/>
                    </Link>
                </div>
                <div className={styles.links}>
                    <Link href={user.loaded && user?.id && user?.token ? '/following' : '/login'}
                          className={router.asPath === '/following' ? styles.active : ''}>
                        Takip Edilenler
                    </Link>
                </div>
            </div>
            <div className={styles.searchBox}>
                <div className={styles.searchInput}>
                    <input type="text" placeholder="Podcaster ara"/>
                    <button>
                        <Search stroke={'#1c1c1c'}/>
                    </button>
                </div>
            </div>
            <div className={styles.account}>
                {user.loaded ? <StartStreamButton/> : ''}
                {user.loaded && user?.id ? (
                    <div className={`${styles.profile} ${showMenu.current ? styles.active : ''}`}
                         onClick={() => handleShowMenu()}>
                        <div className={styles.userName}>{user?.name}</div>
                        <div className={styles.profileImage}>
                            {user?.image ? <img src={`${process.env.IMAGE_CDN}/${user.image}`} alt={user?.name}/> :
                                <DefaultProfile/>}
                        </div>
                        <div className={`${styles.menu} ${showMenu.current ? styles.show : ''}`} ref={menuRef}>
                            <ul>
                                <li>
                                    <Link href={'/profile/[id]'} as={`/profile/${user.id}`}>Profil</Link>
                                </li>
                                <li>
                                    <Link href={'/account'}>Hesap</Link>
                                </li>
                                <li className={styles.separator}></li>
                                {user.admin ? (
                                    <li>
                                        <Link href={'/admin'}>Admin paneli</Link>
                                    </li>
                                ) : ''}
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
                        <Link href={'/register'} className={router.asPath === '/register' ? styles.active : ''}>
                            Kayıt Ol
                        </Link>
                    </div>
                ) : ''}
            </div>
        </div>
    )
}