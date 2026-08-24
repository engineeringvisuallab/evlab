/**
 * EV Software Core - useEVAppSDK React Hook
 * Provides seamless, typed SDK access to any sibling application.
 */

import { useMemo } from 'react';
import { useCore } from '../core/store/coreStore';
import { EVCoreClient } from './EVCoreClient';

export function useEVAppSDK(appId: string, appVersion: string = '1.0.0') {
  const core = useCore();

  const sdk = useMemo(() => {
    return new EVCoreClient(
      {
        appId,
        appVersion,
        coreApiVersion: 'v1',
      },
      () => core
    );
  }, [appId, appVersion, core]);

  return {
    sdk,
    currentUser: core.currentUser,
    activeProject: core.activeProject,
    notifications: core.notifications,
  };
}
