import Image from 'next/image';

import { iconSrc } from '@/lib/weather-codes';

interface Props {
  icon: string;
  description: string;
  size?: number;
  className?: string;
  priority?: boolean;
}

export const WeatherIcon = ({
  icon,
  description,
  size = 96,
  className,
  priority = false
}: Props) => {
  return (
    <Image
      className={className}
      src={iconSrc(icon)}
      alt={description}
      width={size}
      height={size}
      priority={priority}
    />
  );
};
