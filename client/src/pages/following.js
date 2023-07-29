import Head from 'next/head'
import styles from '@/styles/home.module.sass'
import PodcastersGrid from '@/components/podcasters-grid'
import {useContext, useEffect} from 'react'
import {AuthContext} from '@/contexts/auth'
import {useRouter} from 'next/router'

export default function Explore() {
    const router = useRouter()
    const [user] = useContext(AuthContext)

    useEffect(() => {
        if (user.loaded && (!user?.id || !user?.token)) router.push('/login')
    }, [user])

    return user.loaded && user?.id && user?.token ? (
        <>
            <Head>
                <title>Takip edilenler - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <PodcastersGrid title={'Takip Ettiklerin'} noMessage={'Şu anda takip ettiğiniz bir podcaster yok.'}/>
            </div>
        </>
    ) : ''
}
