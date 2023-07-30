import Head from 'next/head'
import styles from '@/styles/home.module.sass'
import PodcastersGrid from '@/components/podcasters-grid'
import {useEffect, useState} from 'react'
import axios from 'axios'

export default function Explore() {
    const [loaded, setLoaded] = useState(false)
    const [active, setActive] = useState([])
    const [popular, setPopular] = useState([])
    const [newbie, setNewbie] = useState([])

    const getData = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/podcaster/explore`)
            if (response.data?.status === 'OK') {
                setActive(response.data?.active || [])
                setPopular(response.data?.popular || [])
                setNewbie(response.data?.newbie || [])
            }
            else throw new Error()
        } catch (e) {
        } finally {
            setLoaded(true)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    return (
        <>
            <Head>
                <title>Keşfet - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <PodcastersGrid loaded={loaded} title={'Yayında olanlar'} noMessage={'Şu an yayın yapan bir podcaster yok.'} items={active}/>
                <PodcastersGrid loaded={loaded} title={'En popülerler'} noMessage={'Herhangi bir podcaster bulunamadı.'} items={popular}/>
                <PodcastersGrid loaded={loaded} title={'Yeni podcaster\'lar'} noMessage={'Yeni bir podcaster yok.'} items={newbie}/>
            </div>
        </>
    )
}
