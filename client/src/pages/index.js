import Head from 'next/head'
import styles from '@/styles/home.module.sass'
import PodcastersGrid from '@/components/podcasters-grid'
import {useRouter} from 'next/router'
import {useContext, useEffect} from 'react'
import {AuthContext} from '@/contexts/auth'

export default function Home() {
    const router = useRouter()
    const [user] = useContext(AuthContext)

    useEffect(() => {
        if (user.loaded && (!user?.id || !user?.token)) router.push('/explore')
    }, [user])

    return user.loaded && user?.id && user?.token ? (
        <>
            <Head>
                <title>PodTalks</title>
            </Head>
            <div className={styles.container}>
                <PodcastersGrid title={'Aktif Podcaster\'lar'} noMessage={'Takip ettiklerin arasında şu an canlı yayında olan bir podcaster yok.'}/>
                <PodcastersGrid title={'Son İzlediklerin'} noMessage={'Son izlediğin bir podcaster bulunamadı.'}/>
                <PodcastersGrid title={'Önerilenler'} noMessage={'Sana önerebileceğimiz herhangi bir podcaster şu anda yok.'}/>
            </div>
        </>
    ) : ''
}
