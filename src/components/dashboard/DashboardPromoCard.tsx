import Image from 'next/image'

type DashboardPromoCardProps = {
  title?: string
  subtitle?: string
  description?: string
  imageSrc?: string
  imageAlt?: string
  footerLabel?: string
}

export default function DashboardPromoCard({
  title = 'Contyplacar',
  subtitle = 'Lorem ipsum dolor',
  description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
  imageSrc = '/images/pedro-conty.jpg',
  imageAlt = '',
  footerLabel = 'Saiba mais',
}: DashboardPromoCardProps) {
  return (
    <aside
      aria-label="Sobre o Contyplacar"
      className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-cover"
          sizes="420px"
          priority={false}
        />
      </div>

      <div className="p-5">
        <h2 className="text-xl font-semibold tracking-tight text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">{description}</p>

        {footerLabel ? (
          <div className="mt-4 flex justify-end">
            <span className="text-sm text-gray-500">{footerLabel}</span>
          </div>
        ) : null}
      </div>
    </aside>
  )
}
