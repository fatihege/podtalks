import styles from '@/styles/create-article.module.sass'
import Input from '@/components/form/input'
import {useContext, useEffect, useRef, useState} from 'react'
import Button from '@/components/form/button'
import Head from 'next/head'
import DefaultArticle from '@/icons/default-article'
import AddIcon from '@/icons/add'
import {AlertContext} from '@/contexts/alert'
import {AuthContext} from '@/contexts/auth'
import {useRouter} from 'next/router'
import Textarea from '@/components/form/textarea'
import axios from 'axios'

export default function CreateArticle() {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [, setAlertPopup] = useState(AlertContext)
    const title = useRef('')
    const content = useRef('')
    const [file, setFile] = useState(null)
    const [image, setImage] = useState(null)
    const fileRef = useRef()
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [alert, _setAlert] = useState({
        title: null,
        content: null,
    })
    const alertRef = useRef(alert)

    const setAlert = value => {
        alertRef.current = value
        _setAlert(value)
    }

    useEffect(() => {
        if (user?.loaded && !(user?.id && user?.token)) router.push('/login')
    }, [user])

    useEffect(() => {
        if (alertRef.current.title || alertRef.current.content || !title.current.trim().length || !content.current.trim().length)
            setDisableSubmit(true)
        else setDisableSubmit(false)
    }, [alertRef.current])

    const triggerFileInput = () => fileRef.current?.click()

    const handleFileSelect = e => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > process.env.AP_MAXSIZE) return setAlertPopup({
            active: true,
            title: 'Dosya boyutu çok büyük',
            description: 'Maksimum dosya boyutu 5MB olabilir.',
            button: 'Tamam',
            type: '',
        })

        setFile(file)
        setImage(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setFile(null)
        setImage(null)
    }

    const checkTitle = () => {
        if (!title.current.length) return setAlert({...alertRef.current, title: null})

        if (title.current.trim()?.length < 10) setAlert({...alertRef.current, title: 'Girdiğiniz başlık çok kısa.'})
        else setAlert({...alertRef.current, title: null})
    }

    const checkContent = () => {
        if (!content.current.length) return setAlert({...alertRef.current, content: null})

        if (content.current.trim()?.length < 100) setAlert({...alertRef.current, content: 'En az 100 karakterli bir içerik girmelisiniz.'})
        else setAlert({...alertRef.current, content: null})
    }

    const handleSubmit = async () => {
        if (!user?.loaded || !user?.id || !user?.token || alertRef.current.title || alertRef.current.content || disableSubmit) return
        setDisableSubmit(true)

        try {
            const formData = new FormData()
            formData.append('title', title.current?.trim())
            formData.append('content', content.current?.trim())
            if (file) formData.append('image', file)

            const response = await axios.post(`${process.env.API_URL}/articles/create?user=${user?.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            if (response.data?.status === 'OK') {
                setAlertPopup({
                    active: true,
                    title: 'Başarılı',
                    description: 'Makaleniz başarıyla oluşturuldu.',
                    button: 'Tamam',
                    type: 'primary',
                })
                if (response.data?.id) await router.push(`/articles/${response.data.id}`)
            } else throw new Error()
        } catch (e) {
            if (e.response && e.response.data.errors && Array.isArray(e.response.data.errors) && e.response.data.errors.length)
                for (const error of e.response.data.errors) setAlert({
                    ...alertRef.current,
                    [error.field]: error.message
                })
            else {
                setAlertPopup({
                    active: true,
                    title: 'Bir sorun oluştu',
                    description: 'Makaleniz oluşturulurken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
                    button: 'Tamam',
                    type: ''
                })
                console.error(e)
            }
        } finally {
            setDisableSubmit(false)
        }
    }

    return user?.loaded && user?.id && user?.token && (
        <>
            <Head>
                <title>Makale oluştur - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <h2 className={styles.title}>Makale yazın</h2>
                <div className={styles.form}>
                    <div className={styles.imagePreview}>
                        {image ? <img src={image} alt="Makale önizlemesi"/> : <DefaultArticle/>}
                        <div className={styles.overlay} onClick={() => triggerFileInput()}>
                            <AddIcon/>
                            Görsel yükle
                        </div>
                    </div>
                    {image && <Button type={'danger'} className={styles.removeImage} onClick={() => removeImage()} value="Görseli kaldır"/>}
                    <input type="file" ref={fileRef} className="hide" onChange={handleFileSelect} accept=".png,.jpg,.jpeg"/>
                    <Input placeholder="Makale başlığı" className={styles.inputField} set={title} alert={alert.title} onChange={checkTitle}/>
                    <Textarea placeholder="Makale içeriği" className={styles.inputField} set={content} alert={alert.content} rows={15} onBlur={checkContent}/>
                    <Button value="Makaleyi oluştur" className={styles.inputField} onClick={() => handleSubmit()} disabled={disableSubmit}/>
                </div>
            </div>
        </>
    )
}