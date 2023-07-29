import Head from 'next/head'
import styles from '@/styles/form-page.module.sass'
import Input from '@/components/form/input'
import {checkPasswordField} from '@/utils/checkers'
import Button from '@/components/form/button'
import NextIcon from '@/icons/next'
import {useContext, useEffect, useRef, useState} from 'react'
import {AuthContext} from '@/contexts/auth'
import {useRouter} from 'next/router'
import axios from 'axios'
import {AlertContext} from '@/contexts/alert'

export function getServerSideProps(context) {
    return {
        props: {
            token: context.params.token,
        },
    }
}

export default function Token({token}) {
    const router = useRouter()
    const [user] = useContext(AuthContext)
    const [, setAlertPopup] = useContext(AlertContext)
    const [tokenValid, setTokenValid] = useState(null)
    const password = useRef('')
    const passwordConfirm = useRef('')
    const [disableSubmit, setDisableSubmit] = useState(false)
    const [alert, _setAlert] = useState({
        password: null,
        passwordConfirm: null,
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
        checkToken()
    }, [])

    const checkToken = async () => {
        try {
            const response = await axios.post(`${process.env.API_URL}/user/check-password-token/${token}`)
            if (response.data?.status === 'OK') setTokenValid(true)
            else setTokenValid(false)
        } catch (e) {
            setTokenValid(false)
            console.error(e)
        }
    }

    const handleSubmit = async () => {
        if (user.loaded && (user?.id && user?.token)) return router.push('/')
        if (alert.password || alert.passwordConfirm || disableSubmit) return

        try {
            setDisableSubmit(true)
            const response = await axios.post(`${process.env.API_URL}/user/reset-password/${token}`, {
                password: password.current,
                passwordConfirm: passwordConfirm.current,
            })

            if (response.data?.status === 'OK') {
                setDisableSubmit(false)
                setAlertPopup({
                    active: true,
                    title: 'Şifreniz başarıyla değiştirildi.',
                    description: 'Yeni şifrenizle giriş yapmaya hazırsınız.',
                    button: 'Tamam',
                    type: 'primary',
                })
                router.push('/login')
            } else throw new Error()
        } catch (e) {
            if (e.response && e.response.data.errors && Array.isArray(e.response.data.errors) && e.response.data.errors.length)
                for (const error of e.response.data.errors) setAlert({
                    ...alertRef.current,
                    [error.field]: error.message
                })
            else {
                setDisableSubmit(false)
                setAlertPopup({
                    active: true,
                    title: 'Bir şeyler ters gitti.',
                    description: 'Lütfen daha sonra tekrar deneyin.',
                    button: 'Tamam',
                    type: '',
                })
                console.error(e)
            }
        }
    }

    return user.loaded && (!user?.id || !user?.token) && tokenValid === true ? (
        <>
            <Head>
                <title>Şifrenizi değiştirin - PodTalks</title>
            </Head>
            <div className={styles.formModal}>
                <h3 className={styles.title}>Şifrenizi Sıfırlayın</h3>
                <div className={styles.form}>
                    <Input type="password" placeholder="Yeni şifrenizi girin" className={styles.input} autoComplete="off"
                           set={password} alert={alert.password} onChange={checkPasswordField(password, passwordConfirm, alertRef, setAlert)}/>
                    <Input type="password" placeholder="Şifrenizi onaylayın" className={styles.input} autoComplete="off"
                           set={passwordConfirm} alert={alert.passwordConfirm} onChange={checkPasswordField(password, passwordConfirm, alertRef, setAlert)}/>
                </div>
                <Button value="Şifremi sıfırla" icon={<NextIcon stroke={'#1c1c1c'}/>} onClick={handleSubmit}
                        disabled={disableSubmit}/>
            </div>
        </>
    ) : tokenValid === null ? (
        <div className={styles.formModal}>
            <h3 className={styles.title}>Şifrenizi Sıfırlayın</h3>
            <p className={styles.description}>Bağlantı kontrol ediliyor...</p>
        </div>
    ) : tokenValid === false ? (
        <div className={styles.formModal}>
            <h3 className={styles.title}>Şifrenizi Sıfırlayın</h3>
            <p className={styles.description}>Bu şifre sıfırlama bağlantısı geçersiz. Lütfen tekrar sıfırlamayı deneyin.</p>
        </div>
    ) : ''
}