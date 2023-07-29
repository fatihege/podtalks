import styles from '@/styles/side-panel.module.sass'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import DefaultProfile from '@/icons/default-profile'
import axios from 'axios'

export default function SidePanel() {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [following, setFollowing] = useState(null)

    const getFollowing = async () => {
        if (!user?.loaded || !user?.id || !user?.token) return

        try {
            const response = await axios.get(`${process.env.API_URL}/user?id=${user?.id}&props=following`)
            if (response.data?.status === 'OK') setFollowing(response.data?.user?.following)
            else throw new Error()
        } catch (e) {
            setFollowing([])
        }
    }

    useEffect(() => {
        if (user?.loaded && user?.id && user?.token) getFollowing()
    }, [user, router])

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
                        following?.length > 0 ?
                            (
                                following?.map((podcaster, index) => (
                                    <Link href={'/profile/[id]'} as={`/profile/${podcaster?._id || podcaster?.id}`} key={index}>
                                        <div className={styles.followingItem}>
                                            <div className={styles.podcasterImage}>
                                                {podcaster?.image ? <img src={`${process.env.IMAGE_CDN}/${podcaster.image}`} alt={podcaster?.name}/> : <DefaultProfile/>}
                                            </div>
                                            <div className={styles.podcasterName}>{podcaster.name}</div>
                                            {podcaster?.stream ? <div className={styles.liveTag}>CANLI</div> : ''}
                                        </div>
                                    </Link>
                                ))
                            ) :
                            (<span className={styles.noOne}>{following === null ? '' : 'Takip ettiğiniz bir podcaster yok.'}</span>)
                    ) : user.loaded && (!user?.id || !user?.token) ? (
                        <span className={styles.noOne}>Takip etmek için <Link href={'/login'}>giriş yapın</Link>.</span>
                    ) : ''}
                </div>
            </div>
        </div>
    )
}