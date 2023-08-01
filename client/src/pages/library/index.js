import styles from '@/styles/articles.module.sass'
import {useContext, useEffect, useState} from 'react'
import axios from 'axios'
import LibraryGrid from '@/components/library-grid'
import Head from 'next/head'
import {AuthContext} from '@/contexts/auth'
import Link from 'next/link'

export default function Books() {
    const [user] = useContext(AuthContext)
    const [lastCreated, setLastCreated] = useState(null)
    const [mostPopular, setMostPopular] = useState(null)

    const getBooks = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/library?sort=createdAt&order=desc&limit=50`)
            if (response.data?.status === 'OK') setLastCreated(response.data?.books)
            else throw new Error()
        } catch (e) {
            setLastCreated([])
        }

        try {
            const response = await axios.get(`${process.env.API_URL}/library?sort=hits&order=desc&limit=50`)
            if (response.data?.status === 'OK') setMostPopular(response.data?.books)
            else throw new Error()
        } catch (e) {
            setMostPopular([])
        }
    }

    useEffect(() => {
        getBooks()
    }, [])

    return (
        <>
            <Head>
                <title>Kütüphane - PodTalks</title>
            </Head>
            <div className={styles.container}>
                {user?.loaded && user?.id && user?.token && user?.admin ? (
                    <div className={styles.createArticle}>
                        <Link href={'/library/create'}>Kitap oluştur</Link>
                    </div>
                ) : ''}
                <LibraryGrid title={'En popülerler'} noMessage={'Herhangi bir kitap bulunamadı.'} items={mostPopular}/>
                <LibraryGrid title={'Son eklenenler'} noMessage={'Herhangi bir kitap bulunamadı.'} items={lastCreated}/>
            </div>
        </>
    )
}