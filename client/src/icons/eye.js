export default function EyeIcon({stroke = '#fff', strokeRate = 1}) {
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
            <g transform="translate(0 .041)">
                <circle
                    cx={32}
                    cy={32}
                    r={8.806}
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${3.33 * strokeRate}px`,
                    }}
                />
                <path
                    d="M0 32c21.697-11.884 43.03-11.819 64 0"
                    style={{
                        fill: "none",
                        stroke,
                        strokeWidth: `${3.89 * strokeRate}px`,
                    }}
                    transform="matrix(.68217 0 0 1 10.17 0)"
                />
            </g>
        </svg>
    )
}