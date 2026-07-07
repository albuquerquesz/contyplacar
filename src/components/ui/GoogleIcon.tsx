type GoogleIconProps = {
  className?: string
}

export default function GoogleIcon({ className = 'w-5 h-5' }: GoogleIconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      role="img"
    >
      <path
        fill="#4285F4"
        d="M21.805 10.023H12v3.955h5.625c-.242 1.301-.985 2.406-2.09 3.145v2.613h3.375c1.972-1.816 3.105-4.492 3.105-7.676 0-.738-.066-1.45-.21-2.037z"
      />
      <path
        fill="#34A853"
        d="M12 20.25c2.813 0 5.176-.933 6.902-2.524l-3.375-2.613c-.937.629-2.136 1-3.527 1-2.707 0-5-1.828-5.82-4.293H2.702v2.691A10.5 10.5 0 0 0 12 20.25z"
      />
      <path
        fill="#FBBC05"
        d="M6.18 11.82a6.3 6.3 0 0 1 0-3.64V5.488H2.703a10.5 10.5 0 0 0 0 9.023l3.477-2.691z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.523 0 2.895.523 3.973 1.555l2.977-2.977C17.168 1.86 14.805.75 12 .75A10.5 10.5 0 0 0 2.703 5.488L6.18 8.18C7 5.715 9.293 4.77 12 4.77z"
      />
    </svg>
  )
}
