export default function DefaultArticle({stroke = '#ebebeb', strokeRate = 1}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinecap: "round",
                strokeMiterlimit: 1.5,
            }}
            viewBox="0 0 300 200"
        >
            <path
                d="M0 0h256v256H0z"
                style={{
                    fill: "#373737",
                }}
                transform="scale(1.17188 .78125)"
            />
            <circle
                cx={150}
                cy={100}
                r={44.444}
                style={{
                    fill: "none",
                }}
            />
            <clipPath id="a">
                <circle cx={150} cy={100} r={44.444} />
            </clipPath>
            <g clipPath="url(#a)">
                <path
                    d="m105.556 144.444 48.263-48.263 23.959 23.958 15.374-15.375 40.311 40.31-57.123 25.081-70.784-25.711Z"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${8.69 * strokeRate}px`,
                    }}
                    transform="translate(-23.773 -8.479)"
                />
            </g>
            <circle
                cx={150}
                cy={100}
                r={44.444}
                style={{
                    fill: "none",
                    stroke,
                    strokeWidth: `${8.69 * strokeRate}px`,
                    strokeLinejoin: "round",
                }}
            />
        </svg>
    )
}