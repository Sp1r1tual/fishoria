import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

import { useAppDispatch, useAppSelector } from '@/hooks/core/useAppStore';
import type { WeatherType } from '@/common/types';

import { WoodyButton } from '@/components/UI/buttons/WoodyButton/WoodyButton';

import { setWeather } from '@/store/slices/gameSlice';
import { useAddMoneyMutation } from '@/queries/player.queries';
import { store } from '@/store/store';

import { TimeManager } from '@/game/managers/TimeManager';

import styles from './DebugTerminal.module.css';

interface IDebugTerminalProps {
  onClose: () => void;
  isVisible?: boolean;
}

export function DebugTerminal({
  onClose,
  isVisible = true,
}: IDebugTerminalProps) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isModerator = user?.role === 'MODERATOR' || user?.role === 'ADMIN';

  const { mutateAsync: addMoneyAsync } = useAddMoneyMutation();

  const [input, setInput] = useState('');
  const [history, setHistory] = useState<
    Array<{ text: string; type: 'cmd' | 'info' | 'error' | 'success' }>
  >([
    { text: 'TERMINAL READY.', type: 'info' },
    { text: 'TYPE "HELP" FOR COMMANDS.', type: 'info' },
  ]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [history]);

  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isExpanded]);

  const addLog = (
    text: string,
    type: 'cmd' | 'info' | 'error' | 'success' = 'info',
  ) => {
    setHistory((prev) => [...prev.slice(-40), { text, type }]);
  };

  const onExecute = () => {
    const cmdStr = input.trim();
    if (!cmdStr) return;

    addLog(`$ ${cmdStr}`, 'cmd');

    setCmdHistory((prev) => [cmdStr, ...prev.slice(0, 19)]);
    setHistoryIdx(-1);

    executeCommand(cmdStr);
    setInput('');
  };

  const executeCommand = async (cmdStr: string) => {
    const parts = cmdStr.trim().split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case 'help':
        addLog('AVAILABLE COMMANDS:', 'info');
        addLog('  WEATHER <clear|cloudy|rain> - Update climate');
        addLog('  TIME <hour> - Set game hour (0-23) or show current');
        if (isModerator) {
          addLog('  ADD-MONEY [targetUserId] <amount> - [MOD] Add currency');
        }
        addLog('  CLEAR - Wipe terminal session');
        addLog('  EXIT - Close debug shell');
        break;

      case 'weather': {
        const type = args[0]?.toLowerCase() as WeatherType;
        if (['clear', 'cloudy', 'rain'].includes(type)) {
          dispatch(setWeather(type));
          addLog(`CLIMATE SYNCHRONIZED: ${type.toUpperCase()}`, 'success');
        } else {
          addLog('USAGE: WEATHER <CLEAR|CLOUDY|RAIN>', 'error');
        }
        break;
      }

      case 'time':
        if (args.length > 0) {
          const hour = parseInt(args[0]);
          if (!isNaN(hour) && hour >= 0 && hour <= 23) {
            TimeManager.setGameTime(hour);
            const state = store.getState();
            TimeManager.saveSessionData(
              state.game.weather,
              state.game.weatherForecast,
              state.game.lastWeatherUpdateHour,
            );
            addLog(`TIME TRAVEL SUCCESSFUL: ${hour}:00`, 'success');
          } else {
            addLog('USAGE: TIME <0-23>', 'error');
          }
        } else {
          addLog(
            `CURRENT TIME: ${TimeManager.getTime('game').toLocaleTimeString()}`,
            'info',
          );
        }
        break;

      case 'add-coins':
      case 'add-money': {
        if (!isModerator) {
          addLog('ERROR: PERMISSION DENIED. MODERATOR ONLY.', 'error');
          break;
        }

        let targetId: string | undefined;
        let amount: number;

        if (args.length >= 2) {
          targetId = args[0];
          amount = parseInt(args[1]);
        } else {
          amount = parseInt(args[0]);
        }

        if (!isNaN(amount) && amount > 0) {
          try {
            await addMoneyAsync({ amount, targetUserId: targetId });
            addLog(`WALLET UPDATED: +${amount} COINS`, 'success');
          } catch (err: unknown) {
            let logMsg = 'FAILED TO UPDATE BALANCE';
            if (axios.isAxiosError(err)) {
              const apiMsg = err.response?.data?.message;
              const extracted = Array.isArray(apiMsg) ? apiMsg[0] : apiMsg;
              logMsg = extracted || logMsg;
            }
            addLog(`API ERROR: ${logMsg.toUpperCase()}`, 'error');
          }
        } else {
          addLog('USAGE: ADD-MONEY [TARGET_USER_ID] <AMOUNT>', 'error');
        }
        break;
      }

      case 'clear':
        setHistory([]);
        break;

      case 'exit':
        onClose();
        break;

      default:
        addLog(`ERROR: COMMAND NOT FOUND [${cmd}]`, 'error');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onExecute();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (cmdHistory.length > 0 && historyIdx < cmdHistory.length - 1) {
        const nextIdx = historyIdx + 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx > 0) {
        const nextIdx = historyIdx - 1;
        setHistoryIdx(nextIdx);
        setInput(cmdHistory[nextIdx]);
      } else if (historyIdx === 0) {
        setHistoryIdx(-1);
        setInput('');
      }
    } else if (
      e.key === '`' ||
      e.key === "'" ||
      e.key === 'ё' ||
      e.key === 'Ё'
    ) {
      e.preventDefault();
      onClose();
    }
  };

  const getStyleForType = (type: string) => {
    switch (type) {
      case 'cmd':
        return styles.logCmd;
      case 'error':
        return styles.logError;
      case 'success':
        return styles.logSuccess;
      default:
        return styles.logInfo;
    }
  };

  return (
    <div
      className={`${styles.terminal} ${!isExpanded ? styles['terminal--collapsed'] : ''} ${!isVisible ? styles['terminal--hidden'] : ''}`}
    >
      <div className={styles.header} onClick={() => setIsExpanded(!isExpanded)}>
        <span className={styles.title}>DEBUG SHELL v0.1.7</span>
        <WoodyButton
          variant="brown"
          size="sm"
          className={styles.toggleBtn}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? '[ _ ]' : '[ □ ]'}
        </WoodyButton>
      </div>

      {isExpanded && (
        <>
          <div className={styles.output} ref={outputRef}>
            {history.map((log, i) => (
              <div
                key={i}
                className={`${styles.line} ${getStyleForType(log.type)}`}
              >
                {log.text}
              </div>
            ))}
          </div>
          <div className={styles.inputArea}>
            <span className={styles.prompt}>$</span>
            <input
              id="debug-input"
              name="debug-input"
              ref={inputRef}
              type="text"
              className={styles.input}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
            <WoodyButton
              variant="green"
              size="sm"
              className={styles.enterBtn}
              onClick={onExecute}
            >
              ↵
            </WoodyButton>
          </div>
        </>
      )}
    </div>
  );
}
