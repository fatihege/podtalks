export default function Search({stroke = '#fff', strokeRate = 1}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeMiterlimit: 1.5,
            }}
            viewBox="0 0 64 64"
        >
            <circle
                cx={32}
                cy={32}
                r={11.659}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${2.9 * strokeRate}px`,
                }}
                transform="translate(-12.664 -12.664) scale(1.29339)"
            />
            <path
                d="M27.08 27.08 48 48"
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${4.83 * strokeRate}px`,
                    strokeLinecap: "butt",
                }}
                transform="matrix(.64684 -.13022 -.13022 .64684 25.558 25.558)"
            />
        </svg>
    )
}