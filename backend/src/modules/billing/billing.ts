export interface BillInput {
  bookedMinutes: number;
  parkedMinutes: number;
  hourlyRate: number;
  overtimeMultiplier: number;
  penaltyPerHour: number;
}

export interface BillBreakdown {
  baseAmount: number;
  overtimeAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  overtimeMinutes: number;
}

export const computeBill = (input: BillInput): BillBreakdown => {
  const bookedHours = Math.ceil(input.bookedMinutes / 60);
  const baseAmount = bookedHours * input.hourlyRate;

  const overtimeMinutes = Math.max(0, input.parkedMinutes - input.bookedMinutes);
  if (overtimeMinutes === 0) {
    return { baseAmount, overtimeAmount: 0, penaltyAmount: 0, totalAmount: baseAmount, overtimeMinutes: 0 };
  }

  const overtimeHours = Math.ceil(overtimeMinutes / 60);
  const overtimeAmount = overtimeHours * input.hourlyRate * input.overtimeMultiplier;
  const penaltyAmount = overtimeHours * input.penaltyPerHour;

  return {
    baseAmount,
    overtimeAmount,
    penaltyAmount,
    totalAmount: baseAmount + overtimeAmount + penaltyAmount,
    overtimeMinutes
  };
};
