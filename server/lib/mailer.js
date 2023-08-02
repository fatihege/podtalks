import nodemailer from 'nodemailer'

export default (user, pass) => nodemailer.createTransport({
    service: 'hotmail',
    host: 'smtp-mail.outlook.com',
    port: 587,
    auth: {
        user,
        pass,
    }
})