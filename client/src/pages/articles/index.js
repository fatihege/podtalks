import styles from '@/styles/articles.module.sass'
import {useContext, useEffect, useState} from 'react'
import axios from 'axios'
import ArticlesGrid from '@/components/articles-grid'
import Head from 'next/head'
import {AuthContext} from '@/contexts/auth'
import Link from 'next/link'

export default function Articles() {
    const [user] = useContext(AuthContext)
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
                {user?.loaded && user?.id && user?.token ? (
                    <div className={styles.createArticle}>
                        <Link href={'/articles/create'}>Makale oluştur</Link>
                    </div>
                ) : ''}
                <ArticlesGrid loaded={mostPopular === null} title={'En popülerler'} noMessage={'Herhangi bir makale bulunamadı.'} items={mostPopular}/>
                <ArticlesGrid loaded={lastCreated === null} title={'Son eklenenler'} noMessage={'Herhangi bir makale bulunamadı.'} items={lastCreated}/>
            </div>
        </>
    )
}