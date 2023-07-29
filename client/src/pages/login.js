import styles from '@/styles/form-page.module.sass'
import Logo from '@/icons/logo'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import Link from 'next/link'
import {useRouter} from 'next/router'
import {useContext, useEffect, useRef, useState} from 'react'
import checkEmail from '@/utils/check-email'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import NextIcon from '@/icons/next'
import Head from 'next/head'

export default function Login() {
    const router = useRouter()
    const [user, setUser] = useContext(AuthContext)
    const [, setAlertPopup] = useContext(AlertContext)
    const email = useRef('')
    const password = useRef('')
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [alert, _setAlert] = useState({
        email: null,
        password: null,
    })
    const alertRef = useRef(alert)

    const setAlert = value => {
        alertRef.current = value
        _setAlert(value)
    }

    useEffect(() => {
        if (user.loaded && (user?.id && user?.token)) router.push('/')
    }, [user])

    useEffect(() => {
        if (alertRef.current.email || alertRef.current.password || !email.current.trim().length || !password.current.length)
            setDisableSubmit(true)
        else setDisableSubmit(false)
    }, [alertRef.current])

    const checkEmailField = () => {
        if (!email.current?.length) return setAlert({...alertRef.current, email: null})

        if (!checkEmail(email.current)) setAlert({
            ...alertRef.current,
            email: 'Girdiğiniz e-posta adresi geçersiz.'
        })
        else setAlert({...alertRef.current, email: null})
    }

    const checkPassword = () => setAlert({...alertRef.current, password: null})

    const handleSubmit = async () => {
        if (alert.email || alert.password || disableSubmit) return
        setDisableSubmit(true)

        try {
            const response = await axios.post(`${process.env.API_URL}/user/login`, {
                email: email.current,
                password: password.current,
            })

            if (response.data?.status === 'OK') {
                setUser({loaded: true, ...response.data.user})
                router.push('/')
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
                    title: 'Üzgünüz',
                    description: 'Hesabınıza giriş yaparken bir sorunla karşılaştık.',
                    button: 'Tamam',
                    type: '',
                })
                console.error(e)
            }
        } finally {
            setDisableSubmit(false)
        }
    }

    return user.loaded && (!user?.id || !user?.token) ? (
        <>
            <Head>
                <title>Giriş yap - PodTalks</title>
            </Head>
            <div className={styles.formModal}>
                <div className={styles.logo}>
                    <Logo/>
                </div>
                <h3 className={styles.title}>PodTalks hesabınıza giriş yapın</h3>
                <p className={styles.description}>Podcast ile dolu bir dünyaya giriş yapın</p>
                <div className={styles.form}>
                    <div className={styles.inputGroup}>
                        <Input type="text" placeholder="E-posta adresiniz" className={styles.input} autoComplete="off"
                               set={email} alert={alert.email} onChange={checkEmailField}/>
                        <Input type="password" placeholder="Şifreniz" className={styles.input} autoComplete="off"
                               set={password} alert={alert.password} onChange={checkPassword}/>
                    </div>
                    <Button value="Giriş yap" icon={<NextIcon stroke={'#1c1c1c'}/>} onClick={handleSubmit}
                            disabled={disableSubmit}/>
                </div>
                <div className={styles.extras}>
                    <span onClick={() => router.push('/register')}>Yeni bir hesap oluşturun</span>
                    <Link href={'/forgot-password'}>Şifrenizi mi unuttunuz?</Link>
                </div>
            </div>
        </>
    ) : ''
}