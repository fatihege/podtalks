import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import axios from 'axios'
import Error404 from '@/pages/404'
import Head from 'next/head'
import styles from '@/styles/book.module.sass'
import Button from '@/components/form/button'
import {AlertContext} from '@/contexts/alert'
import {useRouter} from 'next/router'
import DefaultBook from '@/icons/default-book'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function BookPage({id}) {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [, setAlert] = useContext(AlertContext)
    const [book, setBook] = useState(null)
    const [sure, setSure] = useState(0)
    const sureRef = useRef(sure)
    const timeoutRef = useRef(null)

    const getBookInfo = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/library/${id}`)

            if (response.data?.status === 'OK') setBook(response.data?.book)
            else throw new Error()
        } catch (e) {
            setBook({notFound: true})
        }
    }

    useEffect(() => {
        if (!book || book?.id !== id) getBookInfo()
    }, [id])

    const handleDeleteSure = () => {
        if (!user?.loaded || !user?.admin) return
        setSure(sure + 1 > 2 ? 0 : sure + 1)
    }

    const deleteBook = async () => {
        try {
            const response = await axios.delete(`${process.env.API_URL}/library/${id}`)

            if (response.data?.status === 'OK') {
                setAlert({
                    active: true,
                    title: 'Başarılı',
                    description: 'Kitap başarıyla silindi.',
                    button: 'Tamam',
                    type: 'primary',
                })
                await router.push('/library')
            }
        } catch (e) {
            setAlert({
                active: true,
                title: 'Bir hata oluştu.',
                description: 'Lütfen daha sonra tekrar deneyiniz.',
                button: 'Tamam',
                type: '',
            })
        }
    }

    useEffect(() => {
        sureRef.current = sure
        if (sure === 1) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = setTimeout(() => sureRef.current !== 2 ? setSure(0) : deleteBook(), 5000)
        }
    }, [sure])

    return book?.notFound ? <Error404/> :
        book ? (
            <>
                <Head>
                    <title>{book?.title?.trim()} - PodTalks</title>
                </Head>
                <div className={styles.container}>
                    <div className={styles.wrapper}>
                        <div className={styles.bookImage}>
                            {book?.image ?
                                <img src={`${process.env.CDN_URL}/${book.image}`} alt={book?.title}/> :
                                <DefaultBook/>}
                        </div>
                        {book?.audio && (
                            <div className={styles.audio}>
                                <audio src={`${process.env.CDN_URL}/${book?.audio}`} controls/>
                            </div>
                        )}
                        <h1 className={styles.bookTitle}>{book?.title?.trim()}</h1>
                        <div className={styles.bookContent}>
                            {book?.content?.trim().split('\n').map((paragraph, i) => paragraph?.trim()?.length ?
                                <p key={i}>{paragraph}</p> : '')}
                        </div>
                        <div className={styles.bookAuthor}>
                            <div className={styles.bookAuthorName}>
                                <span>{book?.author}</span>
                            </div>
                        </div>
                        {user?.loaded && user?.admin && (
                            <div className={styles.deleteBook}>
                                <Button className={styles.deleteBookButton}
                                        value={sure === 0 ? 'Kitabı sil' : sure === 1 ? 'Emin misiniz?' : 'Kitap siliniyor (iptal edebilirsiniz)'}
                                        type={'danger'} onClick={() => handleDeleteSure()}/>
                            </div>
                        )}
                    </div>
                </div>
            </>
        ) : ''
}