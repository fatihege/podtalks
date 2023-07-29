export default function randomRGB() {
    const r = Math.floor(Math.random() * 100) + 155
    const g = Math.floor(Math.random() * 100) + 155
    const b = Math.floor(Math.random() * 100) + 155
    return `rgb(${r}, ${g}, ${b})`
}