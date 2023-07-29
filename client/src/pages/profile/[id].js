import {useRouter} from 'next/router'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import axios from 'axios'
import Head from 'next/head'
import styles from '@/styles/profile.module.sass'
import DefaultProfile from '@/icons/default-profile'
import dateToString from '@/utils/date-to-string'
import Link from 'next/link'
import Error404 from '@/pages/404'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function Profile({id}) {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [, setAlert] = useContext(AlertContext)
    const [profile, setProfile] = useState(null)
    const [activeTab, setActiveTab] = useState(0)

    const getUserInfo = async () => {
        setActiveTab(0)

        try {
            const response = await axios.get(`${process.env.API_URL}/user?id=${id}&props=*,followers,following`)

            if (response.data?.status === 'OK') setProfile(response.data?.user)
            else throw new Error()
        } catch (e) {
            setProfile({notFound: true})
        }
    }

    useEffect(() => {
        if (!profile || profile?.id !== id) getUserInfo()
    }, [id])

    const handleTab = tab => {
        if (tab === activeTab) setActiveTab(0)
        else setActiveTab(tab)
    }

    return profile?.notFound ? <Error404/> :
        profile ? (
        <>
            <Head>
                <title>{profile?.name} - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.profileSection}>
                    <div className={styles.profileImage}>
                        {profile?.image ? <img src={`${process.env.IMAGE_CDN}/${profile.image}`} alt=""/> :
                            <DefaultProfile/>}
                    </div>
                    <div className={styles.profileInfo}>
                        <h3 className={styles.name}>{profile?.name}</h3>
                        {profile?.bio?.trim()?.length ? <p className={styles.bio}>{profile.bio.trim()}</p> : ''}
                        <div className={styles.joinedAt}>{dateToString(new Date(profile.createdAt))} tarihinde katıldı
                        </div>
                    </div>
                    <div className={styles.profileAction}>
                        {user?.id === profile?.id ?
                            (<Link href={'/account'} className={styles.editLink}>Profili Düzenle</Link>) :
                            (<button className={`${styles.followButton}`}>Takip Et</button>)}
                    </div>
                </div>
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeTab === 1 ? styles.active : ''}`}
                            onClick={() => handleTab(1)}>{profile?.followers?.length} Takipçi
                    </button>
                    <button className={`${styles.tab} ${activeTab === 2 ? styles.active : ''}`}
                            onClick={() => handleTab(2)}>{profile?.following?.length} Takip edilen
                    </button>
                </div>
                <div className={styles.tabContent}>
                    {activeTab === 1 ? (
                        <div className={styles.follows}>
                            {profile?.followers?.length ? profile?.followers.map(follower => (
                                <Link href={'/profile/[id]'} as={`/profile/${follower?._id}`} className={styles.follow} key={follower?._id}>
                                    <div className={styles.followImage}>
                                        {follower?.image ?
                                            <img src={`${process.env.IMAGE_CDN}/${follower.image}`} alt=""/> :
                                            <DefaultProfile/>}
                                    </div>
                                    <div className={styles.followName}>
                                        {follower?.name}
                                    </div>
                                </Link>
                            )) : (<div className={styles.noData}>{profile?.id === user?.id ? 'Herhangi bir takipçin yok.' : 'Bu kullanıcıyı kimse takip etmiyor.'}</div>)}
                        </div>
                    ) : activeTab === 2 ? (
                        <div className={styles.follows}>
                            {profile?.following?.length ? profile?.following.map(follow => (
                                <Link href={'/profile/[id]'} as={`/profile/${follow?._id}`} className={styles.follow} key={follow?._id}>
                                    <div className={styles.followImage}>
                                        {follow?.image ?
                                            <img src={`${process.env.IMAGE_CDN}/${follow.image}`} alt=""/> :
                                            <DefaultProfile/>}
                                    </div>
                                    <div className={styles.followName}>
                                        {follow?.name}
                                    </div>
                                </Link>
                            )) : (<div className={styles.noData}>{profile?.id === user?.id ? 'Kimseyi takip etmiyorsun.' : 'Bu kullanıcı kimseyi takip etmiyor.'}</div>)}
                        </div>
                    ) : ''}
                </div>
            </div>
        </>
    ) : ''
}