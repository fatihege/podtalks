import Head from 'next/head'
import styles from '@/styles/home.module.sass'
import PodcastersGrid from '@/components/podcasters-grid'
import StartStreamButton from '@/components/start-stream-button'

export default function Home() {
    return (
        <>
            <Head>
                <title>PodTalks</title>
            </Head>
            <div className={styles.container}>
                <StartStreamButton/>
                <PodcastersGrid title={'Aktif Podcaster\'lar'} noMessage={'Takip ettiklerin arasında şu an canlı yayında olan bir podcaster yok.'}/>
                <PodcastersGrid title={'Son İzlediklerin'} noMessage={'Son izlediğin bir podcaster bulunamadı.'}/>
                <PodcastersGrid title={'Önerilenler'} noMessage={'Sana önerebileceğimiz herhangi bir podcaster şu anda yok.'}/>
            </div>
        </>
    )
}
