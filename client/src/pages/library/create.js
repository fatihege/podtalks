import styles from '@/styles/create-book.module.sass'
import Input from '@/components/form/input'
import {useContext, useEffect, useRef, useState} from 'react'
import Button from '@/components/form/button'
import Head from 'next/head'
import AddIcon from '@/icons/add'
import {AlertContext} from '@/contexts/alert'
import {AuthContext} from '@/contexts/auth'
import {useRouter} from 'next/router'
import Textarea from '@/components/form/textarea'
import axios from 'axios'
import DefaultBook from '@/icons/default-book'

export default function CreateBook() {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [, setAlertPopup] = useState(AlertContext)
    const title = useRef('')
    const author = useRef('')
    const content = useRef('')
    const [file, setFile] = useState(null)
    const [audio, setAudio] = useState(null)
    const [image, setImage] = useState(null)
    const [audioPreview, setAudioPreview] = useState(null)
    const fileRef = useRef()
    const audioRef = useRef()
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [alert, _setAlert] = useState({
        title: null,
        author: null,
        content: null,
    })
    const alertRef = useRef(alert)

    const setAlert = value => {
        alertRef.current = value
        _setAlert(value)
    }

    useEffect(() => {
        if (user?.loaded && !(user?.id && user?.token)) router.push('/login')
        if (user?.loaded && !user.admin) router.push('/404')
    }, [user])

    useEffect(() => {
        if (alertRef.current.title || alertRef.current.content || !title.current.trim().length || !content.current.trim().length)
            setDisableSubmit(true)
        else setDisableSubmit(false)
    }, [alertRef.current])

    const triggerFileInput = () => fileRef.current?.click()
    const triggerAudioInput = () => audioRef.current?.click()

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

        if (file.type.split('/')[0] !== 'image') return setAlertPopup({
            active: true,
            title: 'Dosya tipi desteklenmiyor',
            description: 'Lütfen bir resim dosyası seçin.',
            button: 'Tamam',
            type: '',
        })

        setFile(file)
        setImage(URL.createObjectURL(file))
    }

    const handleAudioSelect = e => {
        const file = e.target.files[0]
        if (!file) return

        if (file.size > process.env.AUDIO_MAXSIZE) return setAlertPopup({
            active: true,
            title: 'Dosya boyutu çok büyük',
            description: 'Maksimum dosya boyutu 15MB olabilir.',
            button: 'Tamam',
            type: '',
        })

        if (file.type.split('/')[0] !== 'audio') return setAlertPopup({
            active: true,
            title: 'Dosya tipi desteklenmiyor',
            description: 'Lütfen bir ses dosyası seçin.',
            button: 'Tamam',
            type: '',
        })

        setAudio(file)
        setAudioPreview(URL.createObjectURL(file))
    }

    const removeImage = () => {
        setFile(null)
        setImage(null)
    }

    const checkTitle = () => {
        if (!title.current.length) return setAlert({...alertRef.current, title: null})
        else setAlert({...alertRef.current, title: null})
    }

    const checkAuthor = () => {
        if (!author.current.length) return setAlert({...alertRef.current, author: null})
        else setAlert({...alertRef.current, author: null})
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
            formData.append('author', author.current?.trim())
            formData.append('content', content.current?.trim())
            if (file) formData.append('image', file)
            if (audio) formData.append('audio', audio)

            const response = await axios.post(`${process.env.API_URL}/library/create?user=${user?.id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            if (response.data?.status === 'OK') {
                setAlertPopup({
                    active: true,
                    title: 'Başarılı',
                    description: 'Kitap başarıyla oluşturuldu.',
                    button: 'Tamam',
                    type: 'primary',
                })
                if (response.data?.id) await router.push(`/library/${response.data.id}`)
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
                    description: 'Kitap oluşturulurken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.',
                    button: 'Tamam',
                    type: ''
                })
                console.error(e)
            }
        } finally {
            setDisableSubmit(false)
        }
    }

    return user?.loaded && user?.admin && (
        <>
            <Head>
                <title>Kitap oluştur - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <h2 className={styles.title}>Kitap oluşturun</h2>
                <div className={styles.form}>
                    <div className={styles.imagePreview}>
                        {image ? <img src={image} alt="Kitap önizlemesi"/> : <DefaultBook/>}
                        <div className={styles.overlay} onClick={() => triggerFileInput()}>
                            <AddIcon/>
                            Görsel yükle
                        </div>
                    </div>
                    {image && <Button type={'danger'} className={styles.removeImage} onClick={() => removeImage()} value="Görseli kaldır"/>}
                    <input type="file" ref={fileRef} className="hide" onChange={handleFileSelect} accept=".png,.jpg,.jpeg"/>
                    <div className={styles.audioUpload}>
                        <Button className={styles.audioUploadButton} onClick={() => triggerAudioInput()} value="Ses dosyası yükle"></Button>
                        {audioPreview && <audio src={audioPreview} controls></audio>}
                        <input type="file" ref={audioRef} className="hide" onChange={handleAudioSelect} accept=".mp3"/>
                    </div>
                    <Input placeholder="Kitap başlığı" className={styles.inputField} set={title} alert={alert.title} onChange={checkTitle}/>
                    <Input placeholder="Kitap yazarı" className={styles.inputField} set={author} alert={alert.author} onChange={checkAuthor}/>
                    <Textarea placeholder="Kitap içeriği" className={styles.inputField} set={content} alert={alert.content} rows={15} onBlur={checkContent}/>
                    <Button value="Kitap oluştur" className={styles.inputField} onClick={() => handleSubmit()} disabled={disableSubmit}/>
                </div>
            </div>
        </>
    )
}