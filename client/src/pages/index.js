import Head from 'next/head'
import styles from '@/styles/home.module.sass'
import PodcastersGrid from '@/components/podcasters-grid'
import {useRouter} from 'next/router'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import axios from 'axios'

export default function Home() {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [loaded, setLoaded] = useState(false)
    const [following, setFollowing] = useState([])
    const [lastListened, setLastListened] = useState([])

    const getData = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/user?id=${user.id}&props=following,lastListened`)
            if (response.data?.status === 'OK') {
                setFollowing(response.data?.user?.following)
                setLastListened(response.data?.user?.lastListened)
            }
            else throw new Error()
        } catch (e) {
        } finally {
            setLoaded(true)
        }
    }

    useEffect(() => {
        if (user.loaded && (!user?.id || !user?.token)) {
            router.push('/explore')
            return
        }

        if (user?.loaded && user?.id && user?.token) getData()
    }, [user])

    return user.loaded && user?.id && user?.token ? (
        <>
            <Head>
                <title>PodTalks</title>
            </Head>
            <div className={styles.container}>
                <PodcastersGrid loaded={loaded} title={'Aktif podcaster\'lar'} noMessage={'Takip ettiklerin arasında şu an canlı yayında olan bir podcaster yok.'} items={following.filter(f => f.stream)}/>
                <PodcastersGrid loaded={loaded} title={'Son dinlediklerin'} noMessage={'Son dinlediğin bir podcaster bulunamadı.'} items={lastListened}/>
                <PodcastersGrid loaded={loaded} title={'Önerilenler'} noMessage={'Sana önerebileceğimiz herhangi bir podcaster şu anda yok.'}/>
            </div>
        </>
    ) : ''
}
