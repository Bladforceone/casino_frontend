import React, { useEffect } from 'react';
import { useCascadeGameStore } from '@entities/cascade/model/store';
import '@widgets/CasinoControlPanel/ui/CasinoControlPanel.css';
import { CascadeInfoPanel } from '@widgets/CascadeInfoPanel';

export const CascadeControlPanel: React.FC = () => {
    const {
        bet,
        balance,
        isSpinning,
        isResolving,
        isBonusGame,
        freeSpinsLeft,
        spin,
        setBet,
        buyBonus,
        isTurbo,
        setTurbo,
    } = useCascadeGameStore();

    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (
                e.code === 'Space' &&
                !isSpinning &&
                !isResolving &&
                (balance >= bet || isBonusGame)
            ) {
                e.preventDefault();
                spin();
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [spin, isSpinning, isResolving, balance, bet, isBonusGame]);

    // 🎯 Вспомогательные вычисления
    const minBet = 2;
    const maxBet = 1000;

    const canSpin = (balance >= bet || isBonusGame) && !isSpinning && !isResolving;
    const canBuyBonus = balance >= bet * 100 && !isBonusGame && !isSpinning && !isResolving;
    const canDecreaseBet = bet > minBet && !isSpinning && !isResolving;
    const canIncreaseBet = bet < maxBet && !isSpinning && !isResolving;

    const onBetIncrease = () => setBet(bet + 2);
    const onBetDecrease = () => setBet(bet - 2);
    const onTurboToggle = () => setTurbo(!isTurbo);

    return (
        <div className="casino-control-panel">
            <CascadeInfoPanel />

            {/* Кнопка уменьшения ставки */}
            <button
                type="button"
                className="casino-button bet-decrease"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.blur();
                    onBetDecrease();
                }}
                onMouseDown={(e) => e.preventDefault()}
                disabled={!canDecreaseBet}
                title="Уменьшить ставку"
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Отображение ставки */}
            <div className="bet-display">
                <span className="bet-label">Ставка</span>
                <span className="bet-value">{bet}</span>
            </div>

            {/* Кнопка увеличения ставки */}
            <button
                type="button"
                className="casino-button bet-increase"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.blur();
                    onBetIncrease();
                }}
                onMouseDown={(e) => e.preventDefault()}
                disabled={!canIncreaseBet}
                title="Увеличить ставку"
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
            </button>

            {/* Кнопка спина */}
            <button
                type="button"
                className="casino-button spin-button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.blur();
                    spin();
                }}
                onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.blur();
                }}
                onFocus={(e) => {
                    e.preventDefault();
                    e.currentTarget.blur();
                }}
                disabled={!canSpin}
                title={
                    isSpinning
                        ? 'Вращение...'
                        : isResolving
                            ? 'Каскад...'
                            : isBonusGame
                                ? `Фриспин (${freeSpinsLeft})`
                                : 'Крутить'
                }
            >
        <span className="button-label">
          {isBonusGame ? (
              `FREE (${freeSpinsLeft})`
          ) : (
              <img
                  width="50"
                  height="50"
                  src="https://img.icons8.com/ios-filled/50/FFFFFF/play.png"
                  alt="play"
              />
          )}
        </span>
            </button>

            {/* Кнопка турбо */}
            <button
                type="button"
                className={`casino-button turbo-button ${isTurbo ? 'active' : ''}`}
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.blur();
                    onTurboToggle();
                }}
                onMouseDown={(e) => e.preventDefault()}
                disabled={isSpinning || isResolving}
                title={isTurbo ? 'Турбо режим включен' : 'Включить турбо режим'}
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                <span className="button-label">Турбо</span>
            </button>

            {/* Кнопка покупки бонуса */}
            <button
                type="button"
                className="casino-button bonus-button"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.blur();
                    buyBonus();
                }}
                onMouseDown={(e) => e.preventDefault()}
                disabled={!canBuyBonus}
                title={`Купить бонус за ${bet * 100}`}
            >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path
                        d="M12 8V4M12 4L9 7M12 4L15 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <circle cx="12" cy="14" r="2" fill="currentColor" />
                </svg>
                <span className="button-label">Бонус</span>
            </button>
        </div>
    );
};