export default function DefaultProfile({background = '#444', foreground = '#fff'}) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlSpace="preserve"
            style={{
                fillRule: "evenodd",
                clipRule: "evenodd",
                strokeLinejoin: "round",
                strokeMiterlimit: 2,
            }}
            viewBox="0 0 256 256"
        >
            <path
                d="M0 0h256v256H0z"
                style={{
                    fill: background,
                }}
            />
            <path
                d="M128 144.793c-30.664 0-55.559 24.895-55.559 55.558H56.529c0-30.094 18.641-55.869 44.996-66.398-6.973-6.856-11.301-16.394-11.301-26.936 0-20.849 16.927-37.775 37.776-37.775 20.849 0 37.776 16.926 37.776 37.775 0 10.542-4.328 20.08-11.301 26.936 26.355 10.529 44.996 36.304 44.996 66.398h-15.912c0-30.663-24.895-55.558-55.559-55.558Zm0-15.912c12.067 0 21.863-9.797 21.863-21.864S140.067 85.154 128 85.154s-21.863 9.796-21.863 21.863 9.796 21.864 21.863 21.864Z"
                style={{
                    fill: foreground,
                }}
                transform="matrix(.7762 0 0 .7762 28.646 23.37)"
            />
        </svg>
    )
}