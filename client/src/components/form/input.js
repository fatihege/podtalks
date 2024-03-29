import {useEffect, useRef, useState} from 'react'
import styles from '@/styles/inputs.module.sass'

/**
 * @param {string} type
 * @param {string} name
 * @param {string} placeholder
 * @param {string} value
 * @param {string} className
 * @param {'on' | 'off'} autoComplete
 * @param {React.MutableRefObject<string>} set
 * @param {string | null} alert
 * @param {Function: any} onChange
 * @param {Function: any} onBlur
 * @param {Function: any} onKeyDown
 * @param {Function: any} validator
 * @returns {JSX.Element}
 * @constructor
 */
export default function Input({
    type = 'text',
    name = '',
    placeholder = '',
    value = '',
    className = '',
    autoComplete = 'off',
    set = null,
    alert = null,
    onChange = () => {},
    onBlur = () => {},
    onKeyDown = () => {},
    validator = () => {}
}) {
    /**
     * @type {React.MutableRefObject<HTMLInputElement>}
     */
    const inputRef = useRef()
    const [focused, setFocused] = useState(false)
    const [inputAlert, setAlert] = useState(alert)

    useEffect(() => {
        if (!inputRef.current) return

        const handleFocus = () => setFocused(true)
        const handleBlur = () => setFocused(false)

        inputRef.current.addEventListener('focus', handleFocus)
        inputRef.current.addEventListener('blur', handleBlur)
    }, [inputRef])

    useEffect(() => {
        if (inputRef?.current) {
            inputRef.current.value = value
            onChange(value)
        }
    }, [value])

    return (
        <div
            className={`${styles.input} ${focused ? styles.focused : ''} ${set?.current.length || inputRef.current?.value.length || value?.length ? styles.filled : ''} ${inputAlert || alert ? styles.danger : ''} ${className}`}
            onClick={() => inputRef.current?.focus()}
            onKeyDown={onKeyDown}
            style={focused ? {zIndex: 1} : {}}>
            <span className={styles.placeholder}>{placeholder}</span>
            <input type={type} name={name} ref={inputRef} onChange={e => {
                if (set) set.current = e.target.value
                onChange(e.target.value)
                const validatorAlert = validator(e.target.value)
                if (validatorAlert) setAlert(validatorAlert)
                else setAlert(null)
            }} autoComplete={autoComplete} onBlur={onBlur} defaultValue={value}/>
            {inputAlert || alert ? (
                <>
                    <div className={styles.alert}>i</div>
                    <div className={styles.alertMessage}>{inputAlert || alert}</div>
                </>
            ) : ''}
        </div>
    )
}