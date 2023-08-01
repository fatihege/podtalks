import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import axios from 'axios'
import Error404 from '@/pages/404'
import Head from 'next/head'
import styles from '@/styles/article.module.sass'
import DefaultArticle from '@/icons/default-article'
import DefaultProfile from '@/icons/default-profile'
import Link from 'next/link'
import Button from '@/components/form/button'
import {AlertContext} from '@/contexts/alert'
import {useRouter} from 'next/router'

export function getServerSideProps(context) {
    return {
        props: {
            id: context.params.id,
        },
    }
}

export default function ArticlePage({id}) {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [, setAlert] = useContext(AlertContext)
    const [article, setArticle] = useState(null)
    const [sure, setSure] = useState(0)
    const sureRef = useRef(sure)
    const timeoutRef = useRef(null)

    const getArticleInfo = async () => {
        try {
            const response = await axios.get(`${process.env.API_URL}/articles/${id}`)

            if (response.data?.status === 'OK') setArticle(response.data?.article)
            else throw new Error()
        } catch (e) {
            setArticle({notFound: true})
        }
    }

    useEffect(() => {
        if (!article || article?.id !== id) getArticleInfo()
    }, [id])

    const handleDeleteSure = () => {
        if (!user?.loaded || (user?.id !== article?.creator?._id && !user?.admin)) return
        setSure(sure + 1 > 2 ? 0 : sure + 1)
    }

    const deleteArticle = async () => {
        try {
            const response = await axios.delete(`${process.env.API_URL}/articles/${id}`)

            if (response.data?.status === 'OK') {
                setAlert({
                    active: true,
                    title: 'Başarılı',
                    description: 'Makale başarıyla silindi.',
                    button: 'Tamam',
                    type: 'primary',
                })
                await router.push('/articles')
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
            timeoutRef.current = setTimeout(() => sureRef.current !== 2 ? setSure(0) : deleteArticle(), 5000)
        }
    }, [sure])

    return article?.notFound ? <Error404/> :
        article ? (
            <>
                <Head>
                    <title>{article?.title?.trim()} - PodTalks</title>
                </Head>
                <div className={styles.container}>
                    <div className={styles.wrapper}>
                        <div className={styles.articleImage}>
                            {article?.image ?
                                <img src={`${process.env.IMAGE_CDN}/${article.image}`} alt={article?.title}/> :
                                <DefaultArticle/>}
                        </div>
                        <div className={styles.articleAuthor}>
                            <div className={styles.articleAuthorImage}>
                                {article?.creator?.image ?
                                    <img src={`${process.env.IMAGE_CDN}/${article.creator.image}`}
                                         alt={article?.creator?.name}/> : <DefaultProfile/>}
                            </div>
                            <div className={styles.articleAuthorName}>
                                <Link href={'/profile/[id]'}
                                      as={`/profile/${article?.creator?._id || article?.creator?.id}`}>{article?.creator?.name}</Link>
                            </div>
                            {article?.createdAt || article?.updatedAt ? (
                                <div className={styles.createdAt}>
                                    {new Date(article?.createdAt || article?.updatedAt).toLocaleDateString('tr-TR', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        weekday: 'long',
                                    })}
                                </div>
                            ) : ''}
                        </div>
                        <h1 className={styles.articleTitle}>{article?.title?.trim()}</h1>
                        <div className={styles.articleContent}>
                            {article?.content?.trim().split('\n').map((paragraph, i) => paragraph?.trim()?.length ?
                                <p key={i}>{paragraph}</p> : '')}
                        </div>
                        {user?.loaded && (user?.id === article?.creator?._id || user?.admin) && (
                            <div className={styles.deleteArticle}>
                                <Button className={styles.deleteArticleButton}
                                        value={sure === 0 ? 'Makaleyi sil' : sure === 1 ? 'Emin misiniz?' : 'Makale siliniyor (iptal edebilirsiniz)'}
                                        type={'danger'} onClick={() => handleDeleteSure()}/>
                            </div>
                        )}
                    </div>
                </div>
            </>
        ) : ''
}