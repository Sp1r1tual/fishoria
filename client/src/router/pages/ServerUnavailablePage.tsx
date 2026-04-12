import { RouteMetadata } from '@/components/logic/RouteMetadata';
import { ServerUnavailable } from '@/components/errors/ServerUnavailable';

export const ServerUnavailablePage = () => {
  return (
    <>
      <RouteMetadata />
      <ServerUnavailable />
    </>
  );
};
