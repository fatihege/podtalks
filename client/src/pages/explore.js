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
                <PodcastersGrid title={'Yayında olanlar'} noMessage={'Şu an yayın yapan bir podcaster yok.'}/>
            </div>
        </>
    )
}
