import { useTranslation } from 'react-i18next';

import { useIsPortrait } from '@/hooks/ui/useIsPortrait';

import { MainMenu } from '@/components/MainMenu/MainMenu';
import { LakeSelect } from '@/components/LakeSelect/LakeSelect';
import { GameCanvas } from '@/components/GameCanvas/GameCanvas';
import { Inventory } from '@/components/Inventory/Inventory';
import { Gear } from '@/components/Gear/Gear';
import { Modal } from '@/components/UI/modals/Modal/Modal';
import { PortraitOverlay } from '@/components/GameCanvas/PortraitOverlay';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import { navigateTo } from '@/store/slices/uiSlice';

export function GameScreen() {
  const dispatch = useAppDispatch();
  const screen = useAppSelector((s) => s.ui.screen);
  const isPortrait = useIsPortrait();
  const { t } = useTranslation();

  const isGameActive =
    screen === 'game' || screen === 'inventory' || screen === 'gear';

  return (
    <>
      {isGameActive && isPortrait && <PortraitOverlay t={t} />}

      {screen === 'mainMenu' && <MainMenu />}
      {screen === 'lakeSelect' && <LakeSelect />}
      {isGameActive && <GameCanvas />}

      <Modal
        isOpen={screen === 'inventory'}
        onClose={() => dispatch(navigateTo('game'))}
        maxWidth="800px"
      >
        <Inventory isModal />
      </Modal>

      <Modal
        isOpen={screen === 'gear'}
        onClose={() => dispatch(navigateTo('game'))}
        maxWidth="800px"
      >
        <Gear onClose={() => dispatch(navigateTo('game'))} />
      </Modal>
    </>
  );
}
