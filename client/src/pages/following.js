import Head from 'next/head'
import styles from '@/styles/home.module.sass'
import PodcastersGrid from '@/components/podcasters-grid'

export default function Explore() {
    return (
        <>
            <Head>
                <title>Keşfet - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <PodcastersGrid title={'Takip Ettiklerin'} noMessage={'Şu anda takip ettiğiniz bir podcaster yok.'}/>
            </div>
        </>
    )
}
