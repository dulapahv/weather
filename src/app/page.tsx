import { isEnabled } from '@/lib/flags';
import { AppShell } from '@/components/AppShell/AppShell';

const Page = async () => {
  const shareEnabled = await isEnabled('share', true);

  return <AppShell shareEnabled={shareEnabled} />;
};

export default Page;
