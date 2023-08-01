import styles from '@/styles/search.module.sass'
import {useEffect, useState} from 'react'
import axios from 'axios'
import PodcastersGrid from '@/components/podcasters-grid'
import Head from 'next/head'
import SearchBox from '@/components/search-box'
import ArticlesGrid from '@/components/articles-grid'
import LibraryGrid from '@/components/library-grid'

export function getServerSideProps(context) {
    return {
        props: {
            query: context.params.query,
        },
    }
}

export default function SearchResults({query}) {
    const [loaded, setLoaded] = useState(false)
    const [podcasters, setPodcasters] = useState([])
    const [articles, setArticles] = useState([])
    const [books, setBooks] = useState([])
    const [width, setWidth] = useState(null)

    const getData = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/search/${query}`)
            if (response.data?.status === 'OK') {
                setPodcasters(response.data?.podcasters || [])
                setArticles(response.data?.articles || [])
                setBooks(response.data?.books || [])
            }
            else throw new Error()
        } catch (e) {
        } finally {
            setLoaded(true)
        }
    }

    useEffect(() => {
        getData()
    }, [query])

    useEffect(() => {
        window.addEventListener('resize', () => setWidth(window.innerWidth))
        setWidth(window.innerWidth)

        return () => window.removeEventListener('resize', () => setWidth(window.innerWidth))
    }, [])

    return (
        <>
            <Head>
                {loaded ? <title>"{query}" - PodTalks</title> : ''}
            </Head>
            <div className={styles.container}>
                {width <= 470 && (<SearchBox/>)}
                <PodcastersGrid loaded={loaded} title={'Bulunan podcaster\'lar'} noMessage={'Aradığın kriterlere uygun bir podcaster bulunamadı.'} items={podcasters} />
                <ArticlesGrid title={'Bulunan makaleler'} noMessage={'Aradığın kriterlere uygun bir makale bulunamadı.'} items={articles} />
                <LibraryGrid title={'Bulunan kitaplar'} noMessage={'Aradığın kriterlere uygun bir kitap bulunamadı.'} items={books} />
            </div>
        </>
    )
}