import React from 'react';

/**
 * Displays lunar day label in calendar cells.
 * Shows "Mùng X" on sm+ viewports and hides "Mùng " on mobile so cells stay compact.
 */
export const LunarDayLabel: React.FC<{ lunarDay: number }> = ({ lunarDay }) => {
  if (lunarDay >= 1 && lunarDay <= 10) {
    return (
      <>
        <span className="hidden sm:inline">Mùng </span>
        {lunarDay}
      </>
    );
  }
  return <>{lunarDay}</>;
};

