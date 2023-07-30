import Head from 'next/head'
import styles from '@/styles/home.module.sass'
import PodcastersGrid from '@/components/podcasters-grid'
import {useContext, useEffect, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {useRouter} from 'next/router'
import axios from 'axios'

export default function Explore() {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [loaded, setLoaded] = useState(false)
    const [following, setFollowing] = useState([])

    const getFollowedPodcasters = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/user?id=${user.id}&props=following`)
            if (response.data?.status === 'OK') setFollowing(response.data?.user?.following)
            else throw new Error()
        } catch (e) {
        } finally {
            setLoaded(true)
        }
    }

    useEffect(() => {
        if (user.loaded && (!user?.id || !user?.token)) router.push('/login')
        if (user?.loaded && user?.id && user?.token) getFollowedPodcasters()
    }, [user])

    return user.loaded && user?.id && user?.token ? (
        <>
            <Head>
                <title>Takip edilenler - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <PodcastersGrid loaded={loaded} title={'Takip ettiklerin'}
                                noMessage={'Şu anda takip ettiğiniz bir podcaster yok.'} items={following}/>
            </div>
        </>
    ) : ''
}
