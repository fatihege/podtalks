import {useRouter} from 'next/router'
import Head from 'next/head'
import {useContext, useEffect, useRef, useState} from 'react'
import axios from 'axios'
import {AuthContext} from '@/contexts/auth'
import {AlertContext} from '@/contexts/alert'
import Input from '@/components/form/input'
import Button from '@/components/form/button'
import {checkNameField, checkEmailField, checkPasswordField, checkPasswordConfirmField} from '@/utils/checkers'
import styles from '@/styles/account.module.sass'
import Textarea from '@/components/form/textarea'

export default function AccountPage() {
    const router = useRouter()
    const [user, setUser] = useContext(AuthContext)
    const [, setAlertPopup] = useContext(AlertContext)
    const name = useRef('')
    const email = useRef('')
    const bio = useRef('')
    const currentPassword = useRef('')
    const newPassword = useRef('')
    const passwordConfirm = useRef('')
    const [disableInformationSubmit, setDisableInformationSubmit] = useState(false)
    const [disablePasswordSubmit, setDisablePasswordSubmit] = useState(false)
    const [alert, _setAlert] = useState({
        name: null,
        email: null,
        currentPassword: null,
        password: null,
        passwordConfirm: null,
    })
    const alertRef = useRef(alert)

    const setAlert = value => {
        alertRef.current = value
        _setAlert(value)
    }

    useEffect(() => {
        if (alertRef.current.name || alertRef.current.email || !name.current.trim().length || !email.current.trim().length || (name.current.trim() === user.name && email.current.trim() === user.email && bio?.current?.trim() === user.bio?.trim()))
            setDisableInformationSubmit(true)
        else setDisableInformationSubmit(false)

        if (alertRef.current.password || alertRef.current.passwordConfirm || !currentPassword.current.length || !newPassword.current.length || !passwordConfirm.current.length)
            setDisablePasswordSubmit(true)
        else setDisablePasswordSubmit(false)
    }, [alertRef.current])

    const handleBioChange = value => {
        if (value !== user.bio) setDisableInformationSubmit(false)
    }

    useEffect(() => {
        if (!user.loaded) return

        if (!user?.id) {
            router.push('/')
            return
        }

        name.current = user.name
        email.current = user.email
        bio.current = user.bio
    }, [user])

    const handleInformationSubmit = async () => {
        if (!user?.loaded) return
        if (!user?.id) return router.push('/')
        if (!name.current?.length || !email.current?.length || alertRef.current.name || alertRef.current.email) return

        try {
            setDisableInformationSubmit(true)

            const response = await axios.post(`${process.env.API_URL}/user/update/${user.id}`, {
                name: name.current?.trim(),
                email: email.current?.trim(),
                bio: bio.current?.trim(),
            })

            if (response.data?.status === 'OK') {
                await router.reload()
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
                    description: 'Bilgileriniz güncellenirken bir hata oluştu. Daha sonra tekrar deneyin.',
                    button: 'Tamam',
                    type: ''
                })
                console.error(e)
            }

            setDisableInformationSubmit(false)
        }
    }

    const handlePasswordSubmit = async () => {
        if (!user?.loaded) return
        if (!user?.id) return router.push('/')
        if (!currentPassword.current?.length || !newPassword.current?.length || !passwordConfirm.current?.length || alertRef.current.password || alertRef.current.passwordConfirm) return

        try {
            setDisablePasswordSubmit(true)

            const response = await axios.post(`${process.env.API_URL}/user/update/${user.id}`, {
                currentPassword: currentPassword.current,
                newPassword: newPassword.current,
                passwordConfirm: passwordConfirm.current,
            })

            if (response.data.status === 'OK') {
               
                currentPassword.current = ''
                newPassword.current = ''
                passwordConfirm.current = ''

                setAlertPopup({
                    active: true,
                    title: 'Şifreniz değiştirildi',
                    description: 'Şifreniz başarıyla değiştirildi. Artık yeni şifrenizle giriş yapabilirsiniz.',
                    button: 'Tamam',
                    type: 'primary'
                })
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
                    title: 'Bir hata oluştu',
                    description: 'Şifreniz değiştirilirken bir hata oluştu. Daha sonra tekrar deneyin.',
                    button: 'Tamam',
                    type: ''
                })
                console.error(e)
            }

            setDisablePasswordSubmit(false)
        }
    }

    return user?.loaded && user?.id && user?.token ? (
        <>
            <Head>
                <title>Hesap detayları - PodTalks</title>
            </Head>
            <div className={styles.container}>
                <div className={styles.content}>
                    <h1 className={styles.pageTitle}>Hesap bilgileri</h1>
                    <div className={styles.form}>
                        {user.loaded ? (
                            <>
                                <Input type="text" placeholder="Adınız" value={name.current}
                                       set={name} alert={alert.name} onChange={checkNameField(name, alertRef, setAlert)}/>
                                <Input type="text" placeholder="E-posta adresiniz" value={email.current}
                                       set={email} alert={alert.email} onChange={checkEmailField(email, alertRef, setAlert)}/>
                                <Textarea placeholder="Biyografiniz" value={bio.current} set={bio} onChange={handleBioChange}/>
                                <Button value="Bilgileri güncelle" onClick={handleInformationSubmit}
                                        disabled={disableInformationSubmit}/>
                            </>
                        ) : ''}
                    </div>
                    <h1 className={styles.pageTitle}>Şifrenizi değiştirin</h1>
                    <div className={styles.form}>
                        {user.loaded ? (
                            <>
                                <Input type="password" placeholder="Şu anki şifreniz" set={currentPassword} value={currentPassword.current} alert={alert.currentPassword}
                                       onChange={() => {setAlert({...alertRef.current, currentPassword: null})}}/>
                                <Input type="password" placeholder="Yeni şifreniz" set={newPassword} value={newPassword.current} alert={alert.password}
                                       onChange={checkPasswordField(newPassword, passwordConfirm, alertRef, setAlert)}/>
                                <Input type="password" placeholder="Şifrenizi onaylayın" set={passwordConfirm} value={passwordConfirm.current} alert={alert.passwordConfirm}
                                       onChange={checkPasswordConfirmField(newPassword, passwordConfirm, alertRef, setAlert)}/>
                                <Button value="Şifreyi değiştir" onClick={handlePasswordSubmit}
                                        disabled={disablePasswordSubmit}/>
                            </>
                        ) : ''}
                    </div>
                </div>
            </div>
        </>
    ) : ''
}