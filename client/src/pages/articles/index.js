import styles from '@/styles/articles.module.sass'
import {useEffect, useState} from 'react'
import axios from 'axios'
import ArticlesGrid from '@/components/articles-grid'
import Head from 'next/head'

export default function Articles() {
    const [lastCreated, setLastCreated] = useState(null)
    const [mostPopular, setMostPopular] = useState(null)

    const getArticles = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/articles?sort=createdAt&order=desc&limit=50`)
            if (response.data?.status === 'OK') setLastCreated(response.data?.articles)
            else throw new Error()
        } catch (e) {
            setLastCreated([])
        }

        try {
            const response = await axios.get(`${process.env.API_URL}/articles?sort=hits&order=desc&limit=50`)
            if (response.data?.status === 'OK') setMostPopular(response.data?.articles)
            else throw new Error()
        } catch (e) {
            setMostPopular([])
        }
    }

    useEffect(() => {
        getArticles()
    }, [])

    return (
        <>
            <Head>
                <title>Makaleler - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <ArticlesGrid loaded={mostPopular === null} title={'En popülerler'} noMessage={'Herhangi bir makale bulunamadı.'} items={mostPopular}/>
                <ArticlesGrid loaded={lastCreated === null} title={'Son eklenenler'} noMessage={'Herhangi bir makale bulunamadı.'} items={lastCreated}/>
            </div>
        </>
    )
}