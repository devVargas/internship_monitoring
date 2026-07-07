import Button from './Button.tsx'

export default function ArrowButton(props: { LinkTo: string; text: string }) {
    return (
    <Button LinkTo={props.LinkTo}>
        <span>{props.text}</span>

        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="16" height="16"
            aria-hidden="true"
        >
            <path d="m12 5 7 7-7 7" />
        </svg>
    </Button>
    );
}
