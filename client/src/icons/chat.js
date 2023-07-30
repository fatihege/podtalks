export default function ChatIcon({stroke = '#fff', strokeRate = 1}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinecap: "round",
                strokeMiterlimit: 5,
            }}
            viewBox="0 0 64 64"
        >
            <path
                d="m47.959 48.997-5.843-5.575a7.516 7.516 0 0 0-5.189-2.078H25.385A9.343 9.343 0 0 1 16.041 32s0 0 0 0a9.343 9.343 0 0 1 9.344-9.344h12.98a9.597 9.597 0 0 1 9.594 9.594v16.747Z"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.51 * strokeRate}px`,
                }}
                transform="translate(-5.181 -6.8) scale(1.16192)"
            />
        </svg>
    )
}