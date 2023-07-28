import checkEmail from '@/utils/check-email'

/**
 * @param {React.MutableRefObject<string>} name
 * @param {React.MutableRefObject<Object>} alertRef
 * @param {Function} setAlert
 * @returns {(function(): (*|undefined))|*}
 */
export const checkNameField = (name, alertRef, setAlert) => () => {
    if (!name.current.length) return setAlert({...alertRef.current, name: null})

    if (name.current.trim()?.length < 4) setAlert({...alertRef.current, name: 'Girdiğiniz isim çok kısa.'})
    else setAlert({...alertRef.current, name: null})
}

/**
 * @param {React.MutableRefObject<string>} email
 * @param {React.MutableRefObject<Object>} alertRef
 * @param {Function} setAlert
 * @returns {(function(): (*|undefined))|*}
 */
export const checkEmailField = (email, alertRef, setAlert) => () => {
    if (!email.current.length) return setAlert({...alertRef.current, email: null})

    if (!checkEmail(email.current)) setAlert({
        ...alertRef.current,
        email: 'Girdiğiniz e-posta adresi geçersiz.'
    })
    else setAlert({...alertRef.current, email: null})
}

/**
 * @param {React.MutableRefObject<string>} password
 * @param {React.MutableRefObject<string>} passwordConfirm
 * @param {React.MutableRefObject<Object>} alertRef
 * @param {Function} setAlert
 * @returns {(function(): (*|undefined))|*}
 */
export const checkPasswordField = (password, passwordConfirm, alertRef, setAlert) => () => {
    if (!password.current.length) return setAlert({...alertRef.current, password: null})

    if (password.current.length < 6) setAlert({...alertRef.current, password: 'Şifreniz çok kısa.'})
    else setAlert({...alertRef.current, password: null})

    checkPasswordConfirmField(password, passwordConfirm, alertRef, setAlert)()
}

/**
 * @param {React.MutableRefObject<string>} password
 * @param {React.MutableRefObject<string>} passwordConfirm
 * @param {React.MutableRefObject<Object>} alertRef
 * @param {Function} setAlert
 * @returns {(function(): (*|undefined))|*}
 */
export const checkPasswordConfirmField = (password, passwordConfirm, alertRef, setAlert) => () => {
    if (!passwordConfirm.current.length) return setAlert({...alertRef.current, passwordConfirm: null})

    if (password.current !== passwordConfirm.current) setAlert({
        ...alertRef.current,
        passwordConfirm: 'Girdiğiniz şifreler eşleşmiyor.'
    })
    else setAlert({...alertRef.current, passwordConfirm: null})
}